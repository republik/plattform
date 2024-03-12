#!/usr/bin/env node

/** @typedef {import('@orbiting/backend-modules-prolitteris').MessageRequest} MessageRequest */
/** @typedef {import('@orbiting/backend-modules-prolitteris').Participant} Participant */
/** @typedef {import('@orbiting/backend-modules-prolitteris').PixelUid} PixelUid */

const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const readline = require('readline/promises')
require('@orbiting/backend-modules-env').config()
const { string, object, array, parse, optional } = require('valibot')

const { Client } = require('@elastic/elasticsearch')
const {
  assertValidMessageText,
  ProLitterisAPI,
} = require('@orbiting/backend-modules-prolitteris')
const yargs = require('yargs/yargs')

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

async function prepareHandler(args) {
  const PROLITTERIS_MEMBER_NR = Number('0')

  const dbAuthorsFile = await fsp.readFile(path.resolve(args.authors), 'utf8')
  const dbAuthors = JSON.parse(dbAuthorsFile)
  const dbAuthorsById = {}
  const dbAuthorsByName = {}
  for (const author of dbAuthors) {
    dbAuthorsById[author.id] = author
    dbAuthorsByName[`${author.firstName} ${author.lastName}`] = author
  }

  const pathFileStream = readFileOrStdin(args?.pathFile)
  if (!pathFileStream) {
    console.error('no path file was provided')
    process.exit(1)
  }

  const ELASTIC_NODE =
    process.env.ELASTIC_URL || 'http://elastic:elastic@localhost:9200'

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
              'meta.path.keyword': articles,
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

  const outputFileStream = fs.createWriteStream('prolitteris_input.jsonl')
  for (const hit of results.hits.hits) {
    try {
      const doc = parse(ESDocumentSchema, hit._source)

      const messageText = {
        plainText: Buffer.from(doc.contentString, 'utf-8').toString('base64'),
      }

      assertValidMessageText(messageText)

      /**
       * @type {MessageRequest}
       */
      const article = {
        pixelUid: repoIdToPixelUid(doc.meta.repoId, PROLITTERIS_MEMBER_NR),
        participants: [],
        messageText: messageText,
        title: doc.meta.title,
      }

      for (const author of doc.meta.contributors) {
        if (author.kind.toLowerCase() === 'text') {
          const dbData =
            dbAuthorsById[author.userId] || dbAuthorsByName[author.name]

          if (!dbData) {
            console.error('no db data found for %s', author.name)
            continue
          }

          const memberId = getProLitterisId(dbData)
          if (memberId) {
            console.error('MemberID found: %s', memberId)
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

      // Append data in JSONL format
      const data = JSON.stringify(article) + '\n'
      outputFileStream.write(data)
    } catch (error) {
      console.error(error)
      continue
    }
  }

  outputFileStream.end(() => {
    console.error('output written')
  })
}

async function runBatchSubmission(args) {
  const CHECKPOINT_FILE = 'prolitteris.checkpoint'
  const PROLITTERIS_USER_NAME = ''
  if (!PROLITTERIS_USER_NAME) {
    console.error('ProLitteris Username not provied')
    process.exit(1)
  }
  const PROLITTERIS_PW = ''
  if (!PROLITTERIS_PW) {
    console.error('ProLitteris Username not provied')
    process.exit(1)
  }
  const PROLITTERIS_MEMBER_NR = ''
  if (!PROLITTERIS_MEMBER_NR) {
    console.error('ProLitteris MemberNr not provied')
    process.exit(1)
  }

  const jobFile = readFileOrStdin(args.jobfile)
  if (!jobFile) {
    console.error('no job file provided')
    process.exit(1)
  }

  // create checkpoint file if it does not exist
  await fsp.access(CHECKPOINT_FILE, fs.constants.F_OK).catch((_err) => {
    console.log('creating checkpoint file')
    fs.writeFileSync(CHECKPOINT_FILE, '')
  })
  const checkPointFile = fs.createReadStream(CHECKPOINT_FILE)

  const checkPoints = []
  for await (const checkPoint of readline.createInterface({
    input: checkPointFile,
  })) {
    checkPoints.push(checkPoint)
  }

  // capture Ctrl+C to save checkpoint file before exit
  process.on('SIGINT', () => {
    console.error('\nCtrl+C pressed. Writing checkpoint file...')
    fs.writeFileSync(CHECKPOINT_FILE, checkPoints.join('\n'))
    process.exit(0)
  })

  const proLitterisClient = new ProLitterisAPI(
    PROLITTERIS_MEMBER_NR,
    PROLITTERIS_USER_NAME,
    PROLITTERIS_PW,
  )

  for await (const line of readline.createInterface({
    input: jobFile,
  })) {
    try {
      /**
       * @type {MessageRequest}
       */
      const data = JSON.parse(line) // maybe we should validate the body

      if (checkPoints.includes(data.pixelUid)) {
        console.error('Skipping %s: already processed', data.pixelUid)
        continue
      }

      console.error('submitting %s', data.pixelUid)
      const res = await processData(proLitterisClient, data)
      console.error(
        'Submitted %s successfully;\nCreated at %s',
        res.pixelUid,
        res.createdAt,
      )
      checkPoints.push(data.pixelUid)
    } catch (error) {
      console.error('Error submitting data: %s', error)
    }
  }

  await fsp.writeFile(CHECKPOINT_FILE, checkPoints.join('\n'))
}

function readFileOrStdin(filepath) {
  if (filepath) {
    return fs.createReadStream(filepath)
  } else if (!process.stdin.isTTY) {
    return process.stdin
  }
  return null
}

/**
 *
 * @param {ProLitterisAPI} client
 * @param {MessageRequest} data
 */
async function processData(client, data) {
  const res = await client.makeMessage(data)
  if (!res) {
    throw Error('Network error')
  }

  // check if res is of type APIError
  if ('code' in res) {
    const fieldErrors = res.fieldErrors
      ?.map((f) => `field: ${f.field}; ${f.message}`)
      .join('\n')
    // throw error so that it can be logged to stderr
    throw Error(
      `API Error: ${res.code}; ${res.message}` + fieldErrors
        ? `\n${fieldErrors}`
        : '',
    )
  }

  return res
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

yargs(process.argv.slice(2))
  .command(
    'prepare',
    'prepare ProLitteris submission',
    (yargs) => {
      yargs.options({
        authors: {
          alias: 'a',
          type: 'string',
          demandOption: true,
        },
        pathsFile: {
          alias: 'p',
          type: 'string',
        },
      })
    },
    prepareHandler,
  )
  .command(
    'run',
    'run ProLitteris submission',
    (yargs) => {
      yargs.options({
        jobfile: {
          alias: 'f',
          type: 'string',
          demandOption: true,
        },
      })
    },
    runBatchSubmission,
  )
  .demandCommand(1)
  .help()
  .parse()
