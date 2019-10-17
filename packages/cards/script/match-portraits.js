#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const path = require('path')
const recursive = require('recursive-readdir')
const Promise = require('bluebird')
const yargs = require('yargs')
const { promises: fs } = require('fs')

const argv = yargs
  .option('cache', { alias: 'c', default: true })
  .option('path', {
    alias: 'p',
    required: true,
    coerce: input => path.resolve('./', input)
  })
  .argv

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const partyMap = {
  // {Card.party}: folder/{PARTEI}/
  BDP: 'BDP',
  JBDP: 'BDP',

  FDP: 'FDP',
  jf: 'FDP',
  PLR: 'FDP',

  SP: 'SP',
  JUSO: 'SP',
  JSP: 'SP',

  glp: 'GLP',
  jglp: 'GLP',

  CVP: 'CVP',
  CSPO: 'CVP',
  JCVP: 'CVP',
  JCSP: 'CVP',

  Grüne: 'Grüne',
  Gruene: 'Grüne',
  JG: 'Grüne',
  JGBNW: 'Grüne',

  SVP: 'SVP',
  JSVP: 'SVP',

  EVP: 'EVP',
  jevp: 'EVP',

  LDP: 'LDP',
  jLDP: 'LDP',

  Lega: 'Lega',
  Parteilos: 'Parteilos',
  PdA: 'PdA'
}

const parties = Object.keys(partyMap).map(k => k.toLowerCase())

const replaceStrings = [
  // LOREM IPSUM to Lorem Ipsum
  { search: new RegExp('[A-ZÄÖÜ]{2,}', 'g'),
    replace: (match) => match.substr(0, 1) + match.substr(1).toLowerCase()
  },

  // Names
  { search: new RegExp('Ueli'), replace: 'Ulrich' },
  { search: new RegExp('Ruedi'), replace: 'Rudolf' },
  { search: new RegExp('Jacqueline'), replace: 'Jaqueline' },
  { search: new RegExp('Fauchiger'), replace: 'Frauchiger' },
  { search: new RegExp('Gujer'), replace: 'Guyer' },
  { search: new RegExp('Stockholm'), replace: 'Stokholm' },
  { search: new RegExp('Muffi'), replace: 'Muff' },
  { search: new RegExp('K.llin'), replace: 'Kalin' },
  { search: new RegExp('Egli'), replace: 'Eglli' },
  { search: new RegExp('keiser', 'i'), replace: 'Kaiser' },
  { search: new RegExp('Domink'), replace: 'Dominik' },
  { search: new RegExp('Surber'), replace: 'Suber' },
  { search: new RegExp('Crista'), replace: 'Cristina' },
  { search: new RegExp('Ann[^e]'), replace: 'Anne' },
  { search: new RegExp('Rony', 'i'), replace: 'Rosy' },
  { search: new RegExp('Nathalie'), replace: 'Natalie' },
  { search: new RegExp('Z\'graggen', 'i'), replace: 'Zgraggen' },
  { search: new RegExp('Béa'), replace: 'Beatrice' },
  { search: new RegExp('Gian-Reto'), replace: 'Gianreto' },
  { search: new RegExp('Ursind', 'i'), replace: 'Ursin' },
  { search: new RegExp('Cédéric', 'i'), replace: 'Cedric' },
  { search: new RegExp('Stephan', 'i'), replace: 'Stefan' },
  { search: new RegExp('Gerter', 'i'), replace: 'Greter' },
  { search: new RegExp('Hans.Peter', 'i'), replace: 'Hanspeter' },
  { search: new RegExp('Moettli', 'i'), replace: 'Moetteli' },
  { search: new RegExp('Karine', 'i'), replace: 'Karin' },

  // Special cases
  { search: new RegExp('franç|franç|franá', 'i'), replace: 'franc' },

  // Chars
  { search: new RegExp('ä|Ñ|ae|à|á|á|â', 'g'), replace: 'a' },
  { search: new RegExp('ö|î|oe|ô', 'g'), replace: 'o' },
  { search: new RegExp('ü|ü|Å|ue', 'g'), replace: 'u' },
  { search: new RegExp('é|é|Ç|è|è|ê', 'g'), replace: 'e' },
  { search: new RegExp('î|ï|ï|i╠ê', 'i'), replace: 'i' },

  // Regular naming
  { search: new RegExp('(png|jpeg|jpg|rgb)', 'i'), replace: '' },
  { search: new RegExp('(_grune|_qur|_PK-Plakat|_Jpg_klein|_Alternative_hoch|_Alternative|Luzern-Land|JungCspo|_farbig|_wall_2000px|_color_DSC|Spinternational|Spinternation|Psinternational|Psinternation|Liste|Hochformat|Gruene|hochformat|offiziell|LowRes|_rgb_a|Foto_)', 'g'), replace: '' }
]

const toTokens = (string) => {
  replaceStrings.forEach(({ search, replace }) => {
    string = string.replace(search, replace)
  })

  return string
    .replace(/([A-ZÄÖÜ])/g, ' $1')
    .replace(/[^a-zA-Z]/g, ' ')
    .toLowerCase()
    .split(/[\s_-]/)
    .filter(a => a.length > 2)
    .filter(a => !parties.includes(a))
    .filter(Boolean)
    .sort()
}

PgDb.connect().then(async pgdb => {
  console.log('Loading file list...')
  const files = await recursive(argv.path, ['.*'])

  console.log('Tokenizing file names')
  const images = files
    .filter(file => !file.match(/(\.pdf$|Icon\r$|\/triage\/|\/archive\/)/g))
    .map(file => {
      const basename = path.basename(file, '.jpg')
      const party = file.match(/parties\/(.+?)\//, '$1')[1]
      const tokens = toTokens(basename)

      return {
        file,
        basename,
        party,
        tokens
      }
    })

  const hasCache = !!(await pgdb.public.gsheets.count({ name: 'cards/tokenizedCards' }))
  if (!hasCache) {
    await pgdb.public.gsheets.insert({
      name: 'cards/tokenizedCards',
      data: []
    })
  }

  const records = await pgdb.public.cards.findAll()
  let cards = []

  if (argv['cache']) {
    console.log('Loading tokenized cards from cache...')
    cards = await pgdb.public.gsheets.findOneFieldOnly(
      { name: 'cards/tokenizedCards' },
      'data'
    )

    if (cards.length < 1) {
      throw new Error('No cached data available. Run script with --no-cache option.')
    }
  } else {
    console.log('Tokenizing cards...')
    cards = await Promise.map(records, async (record, index) => {
      if (index % 100 === 1) {
        console.log(`  ${index + 1}`)
      }

      // const user = users.find(({ id }) => id === record.userId)
      const user = await pgdb.public.users.findOne({ id: record.userId })

      const name = [record.payload.meta.firstName, record.payload.meta.lastName].join(' ')
      const tokens = toTokens(name)

      return {
        id: record.id,
        identifier: record.payload.meta.userId,
        party: record.payload.party,
        userId: user.id,
        name,
        tokens
      }
    }, { concurrency: 5 })

    await pgdb.public.gsheets.updateOne(
      { name: 'cards/tokenizedCards' },
      { data: cards, updatedAt: new Date() }
    )
  }

  console.log('Evaluating matching score...')
  const evaluatedImages = images.map((image, index, images) => {
    if (index % 100 === 1) {
      console.log(`  ${index + 1}`)
    }

    const { tokens: imageTokens } = image

    const eligibleCards =
      cards
        .filter(card => partyMap[card.party] && partyMap[card.party].includes(image.party))
        .map(card => {
          const maxMatches = Math.max(card.tokens.length, image.tokens.length)
          let matches = 0

          card.tokens.forEach(cardToken => {
            const imageToken = imageTokens.find(imageToken => imageToken === cardToken)
            matches += imageToken ? 1 : 0
          })

          // If a there is only a pair of tokens and score settles on 50. Throw it out.
          if (matches < 2 && maxMatches <= 2) {
            return {
              ...card,
              score: 0
            }
          }

          return {
            ...card,
            score: Number(Number(1 / maxMatches * matches).toPrecision(2))
          }
        })
        .filter(card => card.score > 0)

    const highestCardScore = Math.max.apply(Math, eligibleCards.map(o => o.score))
    const electedCards = eligibleCards.filter(card => card.score === highestCardScore)

    if (electedCards.length > 1) {
      // console.log(image, electedCards)
      return { image, card: false, cards: electedCards, error: 'too many machting cards' }
    } else if (electedCards.length < 1) {
      // console.log(image, electedCards)
      return { image, card: false, cards: electedCards, error: 'no matching cards' }
    }

    const electedCard = electedCards[0]
    if (electedCard.score < 0.5) {
      return { image, card: false, cards: electedCards, error: 'matching score low' }
    }

    return { image, card: electedCard, cards: electedCards, error: false }
  })

  /* errornous */
  evaluatedImages
    .filter(evaluatedImage => evaluatedImage.error)
    .forEach(evaluatedImage => {
      if (evaluatedImage.cards.length > 0) {
        return evaluatedImage.cards.forEach(card => console.log([
          evaluatedImage.image.basename,
          evaluatedImage.image.tokens.join(' '),
          card.name,
          card.identifier,
          card.score,
          card.tokens.join(' '),
          evaluatedImage.error
        ].join('\t')))
      }

      return console.log([
        evaluatedImage.image.basename,
        evaluatedImage.image.party,

        evaluatedImage.image.tokens.join(' '),
        '',
        '',
        0,
        '',
        evaluatedImage.error
      ].join('\t'))
    })

  console.log('Report', {
    evaluatedImages: evaluatedImages.length,
    errornous: evaluatedImages.filter(e => e.error).length
  })

  console.log('Checking for triage folder...')

  const triagePath = path.join(argv.path, '/triage')

  await fs.access(triagePath)
    .catch(e => {
      if (e.code === 'ENOENT') {
        console.log('Creating triage folder...')
        return fs.mkdir(triagePath)
      }

      throw e
    })

  await Promise.map(
    evaluatedImages.filter(evaluatedImage => !evaluatedImage.error),
    async ({ image, card }, index) => {
      if (index % 100 === 1) {
        console.log(`  ${index + 1}`)
      }

      const extname = path.extname(image.file)
      const dest = path.join(triagePath, `/${card.identifier}${extname.toLowerCase()}`)

      const srcSize = await fs.stat(image.file).then(stat => stat.size).catch(() => 0)
      const destSize = await fs.stat(dest).then(stat => stat.size).catch(() => 0)

      if (srcSize !== destSize) {
        return fs.copyFile(image.file, dest)
      }

      return null
    },
    { concurrency: 10 }
  )

  console.log('Done.')

  await pgdb.close()
}).catch(console.error)

// 318719.png
// 318716.png
