#!/usr/bin/env node
/**
 * Script to determine author genders of articles published within
 * a give period.
 *
 * Usage:
 * script/determineAuthorshipGender.js --begin 2019-05-01 --end 2019-07-01
 */

require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const moment = require('moment')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const utils = require('@orbiting/backend-modules-search/lib/utils')
const { mdastToString } = require('@orbiting/backend-modules-utils')

const argv = yargs
  .option('begin', {
    alias: 'b',
    coerce: moment,
    default: moment().subtract(1, 'month').startOf('month')
  })
  .option('end', {
    alias: 'e',
    coerce: moment,
    default: moment().startOf('month')
  })
  .help()
  .version()
  .argv

const unclassifiedAuthors = []
const articles = []

const elastic = Elasticsearch.connect()
const days = argv.end.diff(argv.begin, 'days')

PgDb.connect().then(async pgdb => {
  const classifiedAuthors = await pgdb.public.gsheets.findOneFieldOnly({ name: 'authors' }, 'data')

  const docs = await elastic.search({
    index: utils.getIndexAlias('document', 'read'),
    _source: [
      'meta.path',
      'meta.credits',
      'meta.publishDate'
    ],
    size: days * 10, // sane maximum amount of articles per day
    body: {
      query: {
        bool: {
          must: [
            {
              term: {
                '__state.published': true
              }
            },
            {
              range: {
                'meta.publishDate': {
                  gte: argv.begin.toISOString(),
                  lt: argv.end.toISOString()
                }
              }
            }
          ]
        }
      }
    }
  })

  const hits = docs.hits.hits

  hits
    .map(({ _source: { meta } }) => meta)
    .filter(({ credits }) => credits.length > 0)
    .filter(({ path }) => {
      return ![
        '/2018/02/21/bad-bottles'
      ].includes(path)
    })
    .map(meta => {
      const credits = mdastToString({ children: meta.credits })

      const authorship = credits
        .replace(/(Von|By|Mit) /, '')
        .replace(/(,|:)? ?\d{1,2}.\d{2}.\d{4}/g, '')
        .replace(/ ?\((Text|Moderation|Text und Bilder|Bilder, Audio, Video|Bild und Audio|Photo and Audio)\)/, '')
        .replace('(«New York Times Magazine», Text)', '')
        .replace('Das Abschlussprojekt der Republik-Trainees ', '')
        .replace('(«Correctiv»)', '')
        .replace('«Zetland»', '')
        .replace(/(Translated by|traduit par)/, '')
        .replace('bille berg', 'Sibylle Berg')
        .replace('Mrzyk & Moriceau', 'Mrzyk + Moriceau')
        .replace('Bilder von Christian Grund', 'Christian Grund')
        .replace('Mit Roger de Weck', 'Roger de Weck')
        .replace('Pascal Guntern (Bilder, Audio und Video)', 'Pascal Guntern')
        .replace('  ', ' ')
        .replace(/, Update:?.*/, '')
        .replace(/\(aktualisiert am .+?\)/, '')
        .replace(/Letzte Aktualisierung.*/, '')
        .replace(/(Die|die|der) Republik-Jury/, 'Republik-Jury')
        .replace('Ihrem Expeditionsteam', 'Expeditionsteam')
        .replace(/(Eine? )?(Kommentar|Porträt|Essay|Interview|Einordnung|Gastbeitrag|Preisrede|Aufgezeichnet|Analyse|Bilder|Kolumne|Recherche|Nachruf) von /, '')
        .replace(/Une recherche (d.? ?)/, '')
        .replace('von Anja', 'Anja')
        .split(/( und | and | & |,? mit |,? und |, )/)
        .filter(credit => !credit.match(/( und | and | & |,? mit |,? und |, )/))
        .filter(credit => credit !== '')
        .filter(credit => credit !== '2018')
        .map((credit) => credit.replace(/ \(.+\)/, '').trim())

      // Unable to determine an author
      if (authorship.length < 1) {
        articles.push({ path: meta.path, gender: 'n' })
        return
      }

      // n = unknown, neutral
      // b = both
      // f = female
      // m = male
      const gender = authorship
        .map(authorName => {
          const classifiedAuthor = classifiedAuthors.find(a => a.name === authorName)
          if (!classifiedAuthor) {
            unclassifiedAuthors.push({ author: authorName, path: meta.path })
          }

          return (classifiedAuthor && classifiedAuthor.gender) || 'n'
        })
        .reduce((previousValue, currentValue = 'n') => {
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
        })

      articles.push({ path: meta.path, gender })
    })

  unclassifiedAuthors.map(({ author, path }) => {
    console.warn(`WARNING: Unclassified author "${author}" in ${path}. Add to data/classifiedAuthors.tsv`)
  })

  const stats = {
    begin: argv.begin.toISOString(),
    end: argv.end.toISOString(),

    // n = unknown, neutral
    // b = both
    // f = female
    // m = male
    n: articles.filter(a => a.gender === 'n').length,
    m: articles.filter(a => a.gender === 'm').length,
    b: articles.filter(a => a.gender === 'b').length,
    f: articles.filter(a => a.gender === 'f').length,

    // a = all
    // a-n = all w/o unknown, neutral
    a: articles.length,
    'a-n': articles.length - articles.filter(a => a.gender === 'n').length
  }

  // ratios
  Object.assign(
    stats,
    {
      // gender ratios over all
      'n%': 1 / stats.a * stats.n,
      'm%': 1 / stats.a * stats.m,
      'b%': 1 / stats.a * stats.b,
      'f%': 1 / stats.a * stats.f,

      // gender ratios over all w/o unkown, neutral
      '(m-n)%': 1 / stats['a-n'] * stats.m,
      '(b-n)%': 1 / stats['a-n'] * stats.b,
      '(f-n)%': 1 / stats['a-n'] * stats.f,

      // gender ratios over all w/o unkown, neutral including b (both)
      '(m-n)+b%': 1 / stats['a-n'] * (stats.m + stats.b),
      '(f-n)+b%': 1 / stats['a-n'] * (stats.f + stats.b)
    }
  )

  console.log(stats)

  await pgdb.close()
}).catch(e => { throw e })
