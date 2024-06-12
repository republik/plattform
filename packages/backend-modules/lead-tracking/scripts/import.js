const csvParser = require('csv-parser')
const { connect } = require('@orbiting/backend-modules-base/lib/PgDb')
require('@orbiting/backend-modules-env').config()

async function main(argv) {
  const results = await parse(process.stdin)

  const preparedResults = []
  for (const res of results) {
    if (res.tags.includes(argv.tag)) {
      preparedResults.push({ email: res.email, leadTag: argv.tag })
    }
  }

  const pgdb = await connect()

  try {
    const existingEmails = (await pgdb.public.leadTracking.find({leadTag: argv.tag}, {fields: 'email'})).map((o) => o.email)

    if (existingEmails.length !== 0) {
      console.log('%i Emails already present with tag %s, skipping those', existingEmails.length, argv.tag)
    }

    const filteredResults = preparedResults.filter((res) => !existingEmails.includes(res.email))

    const rows = await pgdb.public.leadTracking.insert(filteredResults, {
      return: ['id'],
    })

    console.log('Emails inserted: %s', rows)
  } catch (e) {
    console.error(e)
  } finally {
    pgdb.close()
  }
}

/**
 * Parse and process csv input from readable stream
 * @param {import('stream').Readable} readStream
 * @returns
 */
async function parse(readStream) {
  const results = []
  const stream = readStream.pipe(
    csvParser({
      mapHeaders: ({ header }) => header.toLowerCase(),
    }),
  )

  for await (const line of stream) {
    results.push({
      email: line['e-mail-adresse'],
      newsletters: line['republik nl'].split(', '),
      // get rid of wrapping double quotes `"` on tag string
      tags: line.tags.split(',').map((s) => s.replace(/^"+|"+$/g, '')),
    })
  }

  return results
}

/**
 * Why include an arg parser if things can be simple?
 * @returns Object
 */
function parseArgv() {
  const tagArgIndex = process.argv.indexOf('-t')
  let tag = null
  if (tagArgIndex > -1) {
    tag = process.argv[tagArgIndex + 1]
  }

  if (tag === null) {
    console.error('import tag is missing')
    process.exit(1)
  }

  return { tag }
}

const args = parseArgv()

main(args)
