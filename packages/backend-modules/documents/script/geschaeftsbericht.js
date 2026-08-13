#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const dayjs = require('dayjs')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))
const visit = require('unist-util-visit')
const { csvFormat } = require('d3-dsv')

const RUN_TIMESTAMP = dayjs().format('YYYY-MM-DD_HHmm')

// Parses a plain 'YYYY-MM-DD' date as a calendar date in Europe/Zurich,
// independent of whatever timezone the process itself runs in (e.g. Heroku
// defaults to UTC) — see republik/script/geschaeftsbericht/lib/dates.js for
// the full rationale (a bare-date/host-timezone mismatch silently shifted a
// membership snapshot by up to 22 hours; the same class of bug applies here
// to the fiscal-year publishDate range, just with much smaller impact).
const startOfDayInZurich = (dateStr) =>
  dayjs.tz(dateStr, 'Europe/Zurich').startOf('day')

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const utils = require('@orbiting/backend-modules-search/lib/utils')
const { t } = require('@orbiting/backend-modules-translate')
const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')

// The `search` resolver only needs elastic/t/redis from its context (we
// pass withoutRelatedDocs: true, so it never touches pgdb). Its redis usage
// is entirely for an optional query-result cache (search/lib/cache.js) —
// not needed for a one-off report script, and requiring a real Redis
// connection just to satisfy an unused cache would be a needless local
// setup burden. This stub matches the interface createCache() expects
// (getAsync/setAsync/delAsync/scanMap) without any network I/O — every
// call is just a cache miss, which is fine here.
const noopRedis = {
  getAsync: async () => undefined,
  setAsync: async () => undefined,
  delAsync: async () => undefined,
  scanMap: async () => undefined,
}

const { getWordsPerMinute } = require('../lib/meta')

const argv = yargs
  .option('from', {
    alias: 'f',
    describe: 'fiscal year start, e.g. 2025-07-01 — start-of-day Europe/Zurich',
    coerce: startOfDayInZurich,
    default: startOfDayInZurich('2025-07-01'),
  })
  .option('to', {
    alias: 't',
    describe:
      'fiscal year end (exclusive), e.g. 2026-07-01 — start-of-day Europe/Zurich',
    coerce: startOfDayInZurich,
    default: startOfDayInZurich('2026-07-01'),
  })
  .option('out', {
    describe: 'output directory',
    string: true,
    default: `${__dirname}/output`,
  })
  .help()
  .version().argv

// Article/newsletter/discussion breakdown + hasAudio/hasVideo come from the
// GraphQL `search` query's aggregations — this is how last year's report
// numbers were actually produced. Calling the resolver directly (no HTTP),
// same technique as voting/scripts/mainstreamscore/seed.js.
const fetchSearchAggregations = async (elastic, from, to) => {
  const result = await search(
    null,
    {
      filter: {
        type: 'Document',
        publishedAt: { from: from.toISOString(), to: to.toISOString() },
      },
      first: 0,
      withoutContent: true,
      withoutRelatedDocs: true,
    },
    { elastic, redis: noopRedis, t },
    undefined,
  )

  const byKey = {}
  result.aggregations.forEach((agg) => {
    byKey[agg.key] = agg
  })

  const templateBuckets = {}
  ;(byKey.template?.buckets || []).forEach((bucket) => {
    templateBuckets[bucket.value] = bucket.count
  })

  return {
    totalCount: result.totalCount,
    templateBuckets,
    hasAudioCount: byKey.hasAudio?.count || 0,
    hasVideoCount: byKey.hasVideo?.count || 0,
  }
}

// charCount and interactive-story candidates have no equivalent aggregation
// (no "sum" aggregation type exists), so these still need a raw ES scroll —
// same query shape as the original documents/script/count.js.
const scrollForCharCountAndCandidates = async (elastic, from, to) => {
  const params = {
    index: utils.getIndexAlias('document', 'read'),
    scroll: '5s',
    size: 100,
    _source: ['meta.path', 'meta.template', 'content', 'contentString'],
    stored_fields: ['contentString.count'],
    body: {
      query: {
        bool: {
          must: [
            { term: { '__state.published': true } },
            {
              terms: {
                'meta.template': ['article', 'editorialNewsletter', 'discussion'],
              },
            },
            {
              range: {
                'meta.publishDate': {
                  gte: from,
                  lt: to,
                },
              },
            },
          ],
        },
      },
    },
  }

  let charCount = 0
  let readingMinutes = 0
  let dynamicComponentCount = 0
  const dynamicComponents = new Set()

  for await (const hit of Elasticsearch.scroll(elastic, params)) {
    const [wordCount] = hit.fields['contentString.count']
    readingMinutes += Math.round(wordCount / getWordsPerMinute())
    charCount += hit._source.contentString?.length || 0

    // Interactive-story candidates: any doc with a DYNAMIC_COMPONENT zone.
    // This is a CANDIDATE list for manual review, not a final count — last
    // year's report hand-picked ~12 URLs out of a larger candidate set.
    let hasDynamicComponent = false
    visit(hit._source.content, 'zone', (node) => {
      if (node.identifier === 'DYNAMIC_COMPONENT' && node.data?.src) {
        hasDynamicComponent = true
      }
    })
    if (hasDynamicComponent) {
      dynamicComponents.add(`https://www.republik.ch${hit._source.meta.path}`)
      dynamicComponentCount++
    }
  }

  return {
    charCount,
    readingMinutes,
    dynamicComponentCount,
    dynamicComponents: Array.from(dynamicComponents),
  }
}

const run = async () => {
  // fiscal year label from the [from, to) range, where `to` is the
  // exclusive upper bound (e.g. 01.07. of the following year). dayjs is
  // immutable, so .subtract() here doesn't affect argv.to used below.
  const fyLabel = `${argv.from.year()}-${argv.to.subtract(1, 'day').year()}`

  console.log('calculating publishing stats (might take a while) …', {
    from: argv.from.toISOString(),
    to: argv.to.toISOString(),
  })

  const elastic = Elasticsearch.connect()

  let aggResult
  let scrollResult
  try {
    aggResult = await fetchSearchAggregations(elastic, argv.from, argv.to)
    scrollResult = await scrollForCharCountAndCandidates(
      elastic,
      argv.from,
      argv.to,
    )
  } finally {
    await elastic.close()
  }

  const result = {
    from: argv.from.toISOString(),
    to: argv.to.toISOString(),
    totalCount: aggResult.totalCount,
    byTemplate: aggResult.templateBuckets,
    hasAudioCount: aggResult.hasAudioCount,
    hasVideoCount: aggResult.hasVideoCount,
    charCount: scrollResult.charCount,
    readingMinutes: scrollResult.readingMinutes,
    dynamicComponentCount: scrollResult.dynamicComponentCount,
    dynamicComponents: scrollResult.dynamicComponents,
  }

  console.log('result', result)

  fs.mkdirSync(argv.out, { recursive: true })
  const jsonPath = path.join(
    argv.out,
    `E-publizistische-arbeit_FY${fyLabel}_${RUN_TIMESTAMP}.json`,
  )
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2))
  console.log(`wrote ${jsonPath}`)

  const candidatesPath = path.join(
    argv.out,
    `E-interactive-story-candidates_FY${fyLabel}_${RUN_TIMESTAMP}.csv`,
  )
  fs.writeFileSync(
    candidatesPath,
    csvFormat(scrollResult.dynamicComponents.map((url) => ({ url }))),
  )
  console.log(
    `wrote ${candidatesPath} — CANDIDATE URLs for manual review, not a final count`,
  )
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
