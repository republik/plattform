#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const debug = require('debug')('statistics:script:postReport')
const moment = require('moment')
const Promise = require('bluebird')
const yargs = require('yargs')
const mdastToString = require('mdast-util-to-string')
const { descending } = require('d3-array')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const { publish: { postMessage } } = require('@orbiting/backend-modules-slack')

const Data = require('../../lib/matomo/data')
const Indexes = require('../../lib/matomo/indexes')
const Documents = require('../../lib/elastic/documents')

const { MATOMO_SITE_ID } = process.env

moment.locale('de-CH')

const SEGMENT_MEMBER = 'dimension1=@member'

const argv = yargs
  .option('date', {
    alias: 'd',
    coerce: moment
  })
  .option('relativeDate', {
    describe: 'ISO 8601 Time Interval e.g. P14D',
    alias: 'r',
    coerce: input => {
      return moment().subtract(moment.duration(input))
    },
    conclicts: ['date']
  })
  .option('limit', {
    alias: 'l',
    number: true,
    default: 8
  })
  .option('idSite', {
    alias: 'i',
    default: MATOMO_SITE_ID
  })
  .option('index-year', {
    describe: 'Use <index-year>\'s median e.g. 2018',
    alias: 'y',
    default: moment().subtract(1, 'year').format('YYYY'),
    coerce: v => moment(`${v}-01-01`)
  })
  .option('channel', {
    describe: 'Slack-Channel or user to post report to',
    alias: 'c',
    default: '#statistik'
  })
  .option('dry-run', {
    describe: 'Disable dry run to post to Slack',
    boolean: true,
    default: true
  })
  .check(argv => {
    if (!argv.date && !argv.relativeDate) {
      return 'Check options. Either provide date, or relative date.'
    }

    return true
  })
  .help()
  .version()
  .argv

/**
 * Data per URL
 */
const getUrls = async ({ date, limit }, { pgdb }) => {
  const urlsOnDate = await pgdb.query(`
    SELECT
      sm.url,
      sm.date,
      sm."publishDate",
      ('${date.format('YYYY-MM-DD')}' - sm."publishDate"::date) + 1 AS "daysPublished"

    FROM "statisticsMatomo" sm
    WHERE
      sm."publishDate" BETWEEN '${date.format('YYYY-MM-DD')}' AND '${date.clone().add(1, 'day').format('YYYY-MM-DD')}'
      AND sm.date = '${date.format('YYYY-MM-DD')}'
      AND sm.segment IS NULL
      AND sm.template = 'article'

    ORDER BY sm."publishDate" DESC
    LIMIT :limit
  `, { limit })

  const left = limit - urlsOnDate.length

  const urlsBeforeDate = await pgdb.query(`
    SELECT
      sm.url,
      sm.date,
      sm."publishDate",
      ('${date.format('YYYY-MM-DD')}' - sm."publishDate"::date) + 1 AS "daysPublished"

    FROM "statisticsMatomo" sm
    WHERE
      sm."publishDate" < '${date.format('YYYY-MM-DD')}'
      AND sm.date = '${date.format('YYYY-MM-DD')}'
      AND sm.segment IS NULL
      AND sm.template = 'article'

    ORDER BY sm.nb_uniq_visitors DESC
    LIMIT :limit
  `, { limit: left > 0 ? left : 0 })

  return [...urlsOnDate, ...urlsBeforeDate]
    .sort((a, b) => descending(a.publishDate, b.publishDate))
}

const getBlock = ({ url, daysPublished, document: { meta }, indexes, distributions }, { date }) => {
  const block = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: [
        `*<${getUltradashboardUrlReportLink(url)}|${meta.title}>*`,
        `_${mdastToString({ children: meta.credits }).replace(`, ${date.format('DD.MM.YYYY')}`, '')}_` + (daysPublished > 1 ? ` (${daysPublished}. Tag)` : ''),
        `*Index ${Math.round(indexes.visitors * 100)}* ⋅ Abonnenten-Index ${Math.round(indexes.memberVisitors * 100)}`,
        'Via ' + distributions
          .sort((a, b) => descending(a.percentage, b.percentage))
          .map(({ source, percentage }) => `${source}: ${percentage}%`)
          .join(' ⋅ ')
      ].join('\n')
    }
  }

  if (meta.image || meta.twitterImage || meta.facebookImage) {
    block.accessory = {
      type: 'image',
      image_url: meta.image || meta.twitterImage || meta.facebookImage,
      alt_text: meta.title
    }
  }

  return block
}

const getRandomQuote = async ({ pgdb }) => {
  const results = await pgdb.query('SELECT * FROM "statisticsQuotes" ORDER BY RANDOM() LIMIT 1')

  if (results.length !== 1) {
    return {}
  }
  const { quote, author } = results[0]
  return { quote, author }
}

const getUltradashboardDailyReportLink = (date) =>
  `https://ultradashboard.republik.ch/public/dashboard/fe40beaf-f7bb-49f1-900e-257785478f1d?datum=${date.format('YYYY-MM-DD')}`

const getUltradashboardUrlReportLink = (url) =>
  `https://ultradashboard.republik.ch/public/dashboard/aa39d4c2-a4bc-4911-8a8d-7b23a1d82425?url=${url}`

Promise.all([PgDb.connect(), Elasticsearch.connect()]).spread(async (pgdb, elastic) => {
  const { limit, idSite, indexYear, channel, dryRun } = argv
  const date = argv.date || argv.relativeDate

  debug('Generate and post report %o', { date: date.toISOString(), limit, indexYear: indexYear.toISOString(), dryRun })

  try {
    const config = {
      props: [
        {
          prop: 'unsegmented',
          segment: null,
          percentile: 'p50',
          indexYear
        },
        {
          prop: 'memberSegmented',
          segment: SEGMENT_MEMBER,
          percentile: 'p50',
          indexYear
        }
      ],
      idSite,
      period: 'day'
    }

    const { pluck: pluckData } = Data(config, { pgdb })
    const { pluck: pluckIndexes } = Indexes(config, { pgdb })
    const { pluck: pluckDocuments } = Documents(config, { elastic })

    const articles = await getUrls({ date, limit }, { pgdb })
      .then(pluckData)
      .then(pluckIndexes)
      .then(pluckDocuments)
      .then(rows => rows.filter(({ document }) => !!document))
      .then(rows => rows.map(row => {
        const { unsegmented, memberSegmented } = row

        const indexes = {
          visitors: unsegmented.p50.nb_uniq_visitors,
          memberVisitors: memberSegmented.p50.nb_uniq_visitors
        }

        // calculated based on pageviews
        const sources = {
          Newsletter: unsegmented['campaign.newsletter.referrals'],
          Kampagnen: unsegmented['campaign.referrals'] - unsegmented['campaign.newsletter.referrals'],

          Twitter: unsegmented['social.twitter.referrals'],
          Facebook: unsegmented['social.facebook.referrals'],
          Instagram: unsegmented['social.instagram.referrals'],
          LinkedIn: unsegmented['social.linkedin.referrals'],
          'andere sozialen Netwerke': unsegmented['social.referrals'] - unsegmented['social.twitter.referrals'] - unsegmented['social.facebook.referrals'] - unsegmented['social.instagram.referrals'] - unsegmented['social.linkedin.referrals'],

          Suchmaschinen: unsegmented['search.visits'],
          'Dritt-Webseiten': unsegmented['website.referrals'],
          'Republik-Webseite': unsegmented['previousPages.referrals'],

          Direkt: unsegmented['direct.visits']
        }

        // unsegmented.pageviews contains loops—reloads, we ignore them and calculate our own total
        const allSources = Object.keys(sources).reduce((acc, curr) => acc + sources[curr], 0)

        /**
         * [ { source: 'Foobar', percentage: 99.9 }, ... ]
         */
        const distributions = Object.keys(sources).map(key => {
          const ratio = 1 / allSources * sources[key]
          const percentage = Math.round(ratio * 1000) / 10

          if (percentage === 0) {
            return false
          }

          return { source: key, percentage }
        }).filter(Boolean)

        debug({ ...row, indexes, sources, distributions })
        return { ...row, indexes, sources, distributions }
      }))

    // Daily quote for amusement
    const { quote, author } = await getRandomQuote({ pgdb })

    if (!dryRun) {
      // Header
      const blocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*<${getUltradashboardDailyReportLink(date)}|Besucher-Tagesrapport>*\n${date.format('dddd, DD.MM.YYYY')}`
          }
        }
      ]

      if (quote && author) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `«${quote}»\n– ${author}`
          }
        })
      }

      // Articles published on <date>
      const recent = articles.filter(b => b.daysPublished === 1)
      if (recent.length > 0) {
        blocks.push({ type: 'divider' })
        blocks.push(
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: [
                `*Beiträge von ${date.format('dddd, DD.MM.YYYY')}*`,
                'Alle Beiträge, die veröffentlicht wurden.'
              ].join('\n')
            }
          }
        )
        recent.forEach(article => blocks.push(getBlock(article, { date })))
      }

      // Earlier articles
      const earlier = articles.filter(b => b.daysPublished !== 1)
      if (earlier.length > 0) {
        blocks.push({ type: 'divider' })
        blocks.push(
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: [
                '*Frühere Beiträge*',
                `Einige Beiträge, die auch am ${date.format('DD.MM.')} aufgerufen, aber früher veröffentlicht wurden.`
              ].join('\n')
            }
          }
        )
        earlier.forEach(article => blocks.push(getBlock(article, { date })))
      }

      // Footer
      blocks.push({ type: 'divider' })
      blocks.push(
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Über diese Daten: Ein Index von 100 Punkten entspricht dem Median aus der Anzahl von Besuchern eines Beitrags am Veröffentlichungstag in ${indexYear.format('YYYY')}. Quellen: <https://piwik.project-r.construction|Matomo> und <https://api.republik.ch/graphiql|api.republik.ch>.`
            }
          ]
        }
      )

      await postMessage({
        channel,
        username: 'Departement für Buchstabenvermessung',
        icon_emoji: ':triangular_ruler:',
        blocks
      })
    }
  } catch (e) {
    console.error(e)
  }

  await pgdb.close()
})
