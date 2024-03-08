#!/usr/bin/env node

/** @typedef {import('../lib/proliterris').MessageRequest} MessageRequest */
/** @typedef {import('../lib/proliterris').Participant} Participant */
/** @typedef {import('../lib/proliterris').PixelUid} PixelUid */

const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const readline = require('readline/promises')
require('@orbiting/backend-modules-env').config()
const { string, object, array, parse, optional } = require('valibot')

const { Client } = require('@elastic/elasticsearch')
const {
  assertValidMessageText,
} = require('@orbiting/backend-modules-prolitteris')
const yargs = require('yargs')

const ESDocumentSchema = object({
  meta: object({
    title: string(),
    repoId: string(),
    contributors: array(
      object({
        name: string(),
        userId: optional(string()),
        kind: string(),
      }),
    ),
  }),
  contentString: string(),
})

async function main(args) {
  const dbAuthorsFile = await fsp.readFile(path.resolve(args.authors), 'utf8')

  let pathFileStream
  if (args?.pathFile) {
    pathFileStream = fs.createReadStream(args?.pathFile)
  } else if (!process.stdin.isTTY) {
    pathFileStream = process.stdin
  } else {
    console.error('no path file was provided')
    process.exit(1)
  }

  const dbAuthors = JSON.parse(dbAuthorsFile)
  const dbAuthorsById = {}
  const dbAuthorsByName = {}
  for (const author of dbAuthors) {
    dbAuthorsById[author.id] = author
    dbAuthorsByName[`${author.firstName} ${author.lastName}`] = author
  }

  const ELASTIC_NODE =
    process.env.ELASTIC_URL || 'http://elastic:elastic@localhost:9200'

  const PROLITERIS_MEMBER_ID = Number('0')

  const esClient = new Client({
    node: ELASTIC_NODE,
  })

  const articles = []
  for await (const line of readline.createInterface({
    input: pathFileStream,
  })) {
    articles.push(line)
  }

  const results = await esClient.search({
    size: articles.length,
    _source: [
      'contentString',
      'meta.contributors',
      'meta.repoId',
      'meta.title',
    ],
    query: {
      bool: {
        must: [
          {
            terms: {
              'meta.path.keyword': [...articles],
            },
          },
          {
            term: {
              '__state.published': {
                value: true,
              },
            },
          },
        ],
      },
    },
  })

  const prolitterisMessages = []
  for (const res of results.hits.hits) {
    try {
      const doc = parse(ESDocumentSchema, res._source)

      const messageText = {
        plainText: Buffer.from(doc.contentString, 'utf-8').toString('base64'),
      }

      assertValidMessageText(messageText)

      /**
       * @type {MessageRequest}
       */
      const article = {
        pixelUid: repoIdToPixelUid(doc.meta.repoId, PROLITERIS_MEMBER_ID),
        participants: [],
        messageText: messageText,
        title: doc.meta.title,
      }

      for (const author of doc.meta.contributors) {
        if (author.kind.toLowerCase() === 'text') {
          // const [firstName, lastName] = author.name.split(' ', 2)

          const dbData = dbAuthorsById[author.userId]

          if (dbData) {
            console.log(`found db data ${JSON.stringify(dbData)}`)
          } else {
            console.warn(`no db data found for ${author.name} skipping work`)
            continue
          }

          const memberId = getProLitterisId(dbData)
          if (memberId) {
            console.log('MemberID found: ' + memberId)
          }

          /**
           * @type {Participant}
           */
          const participant = {
            firstName: dbData.firstName,
            surName: dbData.lastName,
            participation: 'AUTHOR',
            internalIdentification: author?.userId,
            memberId: memberId ? memberId.toString() : undefined,
          }

          article.participants.push(participant)
        }
      }

      prolitterisMessages.push(article)
    } catch (error) {
      console.error(error)
      continue
    }
  }

  // console.log(prolitterisMessages)
}

/**
 *
 * @param {string} repoId
 * @param {number} memberId
 * @returns {PixelUid}
 */
function repoIdToPixelUid(repoId, memberId) {
  return `vzm.${memberId}-${repoId.replace('/', '-')}`
}

function getProLitterisId(dbData) {
  const id = dbData?.prolitterisId
  if (id) {
    const num = id.replace(/[^0-9]/g, '')
    return parseInt(num, 10)
  }
  return null
}

const argv = yargs
  .option('authors', {
    alias: 'a',
    type: 'string',
    demandOption: true,
  })
  .option('pathsFile', {
    alias: 'p',
    type: 'string',
  })
  .help().argv

main(argv)
