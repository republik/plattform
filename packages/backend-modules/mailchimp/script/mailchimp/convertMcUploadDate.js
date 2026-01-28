const csvParser =  require('csv-parser')

async function main() {
  console.log(
    [
      'EMAIL',
      'END_DATE',
    ].join(','),
  )

  const input = await parse(process.stdin)

  input.forEach((record) => {
    if (record.end_date) {
      record.end_date = new Date(record.end_date).toISOString()
      console.log(
        Object.keys(record)
          .map((key) => record[key])
          .join(','),
      )
    }
  })
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
      email: line.email,
      end_date: line.end_date,
    })
  }

  return results
}

main()
