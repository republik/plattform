#!/usr/bin/env node

/** @typedef {import('../lib/proliterris').MessageRequest} MessageRequest */
/** @typedef {import('../lib/proliterris').Participant} Participant */
/** @typedef {import('../lib/proliterris').PixelUid} PixelUid */

require('@orbiting/backend-modules-env').config()
const { string, object, array, parse, optional } = require('valibot')

const { Client } = require('@elastic/elasticsearch')
const {
  assertValidMessageText,
} = require('@orbiting/backend-module-prolitteris')

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

async function main() {
  const ELASTIC_NODE =
    process.env.ELASTIC_URL || 'http://elastic:elastic@localhost:9200'

  const PROLITERIS_MEMBER_ID = Number('0')

  const esClient = new Client({
    node: ELASTIC_NODE,
  })

  const articles = [
    // TODO: get article paths from file
  ]

  const results = await esClient.search({
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
          const [firstName, lastName] = author.name.split(' ', 2)

          /**
           * @type {Participant}
           */
          const participant = {
            firstName: firstName,
            surName: lastName,
            participation: 'AUTHOR',
            internalIdentification: author?.userId,
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

  console.log(prolitterisMessages)
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

main()
