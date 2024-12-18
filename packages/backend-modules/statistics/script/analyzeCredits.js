#!/usr/bin/env node
/**
 * THIS SCRIPT IS FOR DEVELOPMENT PURPOSES ONLY.
 *
 * Script to determine author genders of articles published within
 * a give period.
 *
 * Usage:
 * script/analyzeCredits.js --begin 2021-05-01 --end 2021-07-01
 */

require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const moment = require('moment')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const utils = require('@orbiting/backend-modules-search/lib/utils')

const argv = yargs
  .option('begin', {
    alias: 'b',
    coerce: moment,
    default: moment().subtract(1, 'month').startOf('month'),
  })
  .option('end', {
    alias: 'e',
    coerce: moment,
    default: moment().startOf('month'),
  })
  .option('debug', {
    alias: 'v',
    type: 'boolean',
    default: false,
  })
  .help()
  .version().argv

const elastic = Elasticsearch.connect()
const days = argv.end.diff(argv.begin, 'days')

PgDb.connect()
  .then(async (pgdb) => {
    const { body } = await elastic
      .search({
        index: utils.getIndexAlias('document', 'read'),
        _source: [
          'meta.path',
          'meta.credits',
          'meta.publishDate',
          'meta.contributors',
        ],
        size: days * 8, // sane maximum amount of articles per day
        body: {
          query: {
            function_score: {
              random_score: {},
              query: {
                bool: {
                  must: [
                    {
                      term: {
                        '__state.published': true,
                      },
                    },
                    {
                      range: {
                        'meta.publishDate': {
                          gte: argv.begin.toISOString(),
                          lt: argv.end.toISOString(),
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      })
      .catch((e) => {
        console.error(e.meta.body.error)
        throw new Error('Something broke')
      })

    const hits = body.hits.hits

    const authorsWithUUID = new Map()
    const authorsWithoutUUID = new Map()

    const knownAuthorTypes = [
      'Text',
      'Text und Bilder',
      'Übersetzung und Bildredaktion',
      'Gespräch',
      'Redaktion',
    ]

    for (const hit of hits) {
      for (const author of hit._source.meta.contributors) {
        // skip non text contributors
        if (!knownAuthorTypes.includes(author.kind)) continue

        if ('userId' in author && !authorsWithUUID.has(author.userId)) {
          authorsWithUUID.set(author.userId, null)
        }

        if (typeof author.userId === 'undefined') {
          authorsWithoutUUID.set(author.name, author)
        }
      }
    }

    const knownAuthors = await pgdb.public.users.find({
      id: Array.from(authorsWithUUID.keys()),
    })

    for (const row of knownAuthors) {
      authorsWithUUID.set(row.id, {
        name: `${row.firstName} ${row.lastName}`,
        gender: row.gender,
      })
    }

    if (argv.debug) {
      console.log('known Genders', authorsWithUUID)
      console.log('authors without uuid', authorsWithoutUUID.keys())
    }

    const articles = []
    for (const article of hits) {
      if (article._source.meta.contributors.length === 0) {
        continue // skip articles with no contributors like newsletter
      }

      const textAuthors = article._source.meta.contributors.filter((c) =>
        knownAuthorTypes.includes(c.kind),
      )

      const contributorGenders = textAuthors.map((a) => {
        if ('userId' in a) {
          const author = authorsWithUUID.get(a.userId)
          switch (author?.gender?.toLowerCase()) {
            case 'männlich':
            case 'male':
              return 'm'
            case 'weiblich':
            case 'female':
              return 'f'
            default:
              return 'n'
          }
        }
        return 'n'
      })

      const gender = contributorGenders.reduce(
        (previousValue, currentValue) => {
          if (previousValue === 'n') {
            return currentValue
          }

          if (
            (previousValue === 'f' && currentValue === 'm') ||
            (previousValue === 'm' && currentValue === 'f')
          ) {
            return 'b'
          }

          return previousValue
        },
        'n',
      )

      articles.push({
        path: article._source.meta.path,
        gender: gender,
      })
    }

    const stats = {
      begin: argv.begin.toISOString(),
      end: argv.end.toISOString(),

      // n = unknown, neutral
      // b = both
      // f = female
      // m = male
      n: articles.filter((a) => a.gender === 'n').length,
      m: articles.filter((a) => a.gender === 'm').length,
      b: articles.filter((a) => a.gender === 'b').length,
      f: articles.filter((a) => a.gender === 'f').length,

      // a = all
      // a-n = all w/o unknown, neutral
      a: articles.length,
      'a-n': articles.length - articles.filter((a) => a.gender === 'n').length,
    }

    // ratios
    Object.assign(stats, {
      // gender ratios over all
      'n%': (1 / stats.a) * stats.n,
      'm%': (1 / stats.a) * stats.m,
      'b%': (1 / stats.a) * stats.b,
      'f%': (1 / stats.a) * stats.f,

      // gender ratios over all w/o unkown, neutral
      '(m-n)%': (1 / stats['a-n']) * stats.m,
      '(b-n)%': (1 / stats['a-n']) * stats.b,
      '(f-n)%': (1 / stats['a-n']) * stats.f,

      // gender ratios over all w/o unkown, neutral including b (both)
      '(m-n)+b%': (1 / stats['a-n']) * (stats.m + stats.b),
      '(f-n)+b%': (1 / stats['a-n']) * (stats.f + stats.b),
    })

    console.warn('THIS SCRIPT IS FOR DEVELOPMENT PURPOSES ONLY.')
    console.log('(Verify stats using ./determineAuthorshipGender.js)')
    console.log(stats)

    await pgdb.close()
  })
  .catch((e) => {
    throw e
  })
