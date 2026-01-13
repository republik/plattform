const {
  createFilesIterator,
  maybeReadMessage,
} = require('@orbiting/backend-modules-mailbox/lib/index')

const BULK_SIZE = 500

module.exports = {
  before: () => {},
  insert: async ({ indexName, type: indexType, elastic }) => {
    const stats = { [indexType]: { added: 0, total: 0 } }
    const statsInterval = setInterval(() => {
      console.log(indexName, stats)
    }, 1 * 1000)

    const bulkInsert = async (dataset) => {
      await elastic.bulk({
        body: Array.from(dataset).flatMap((doc) => [
          { index: { _index: indexName, _type: indexType, _id: doc.id } },
          doc,
        ]),
      })
    }

    try {
      const files = await createFilesIterator()

      if (files) {
        const dataset = new Set()

        for await (const file of files) {
          const message = await maybeReadMessage(file.path)

          // Skip if message is not a valid email
          if (!message) {
            continue
          }

          dataset.add(message)

          // Insert if we have enough data
          if (dataset.size >= BULK_SIZE) {
            await bulkInsert(dataset)
            stats[indexType].added += dataset.size
            dataset.clear()
          }
        }

        // Last batch
        if (dataset.size) {
          await bulkInsert(dataset)
          stats[indexType].added += dataset.size
        }
      }
    } catch (e) {
      console.warn(e)
    }

    clearInterval(statsInterval)
    console.log(indexName, stats)
  },
  after: () => {},
  final: () => {},
}
