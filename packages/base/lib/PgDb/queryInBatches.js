const DEFAULT_BATCH_SIZE = 2000

module.exports = async function queryInBatches(
  { handleFn, size = DEFAULT_BATCH_SIZE },
  sql,
  params,
  options,
) {
  if (!handleFn) {
    throw new Error('handleFn argument is missing')
  }

  if (typeof handleFn !== 'function') {
    throw new Error('handleFn argument is not a function')
  }

  const stream = await this.queryAsStream(sql, params, options)

  let count = 0
  let rows = []

  stream.on('data', async (row) => {
    count++
    rows.push(row)

    if (rows.length >= size) {
      stream.pause()
      await handleFn(rows, count, this)
      rows = []
      stream.resume()
    }
  })

  await new Promise((resolve, reject) => {
    stream.on('end', async () => {
      if (rows.length > 0) {
        await handleFn(rows, count, this)
      }

      return resolve()
    })
    stream.on('error', reject)
  })
}
