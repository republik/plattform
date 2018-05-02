module.exports = async ({ indexName, type, elastic, pgdb }) => {
  const stats = { [type]: { added: 0, total: 0 } }
  const statsInterval = setInterval(
    () => { console.log(indexName, stats) },
    1 * 1000
  )

  const comments = await pgdb.public.comments.find()

  stats[type].total = comments.length

  const esDocuments = comments.map(comment => ({
    id: comment.id,
    body: {
      ...comment,
      type
    }
  }))

  for (let doc of esDocuments) {
    await elastic.create({
      ...doc,
      index: indexName,
      type
    })
    stats[type].added++
  }

  clearInterval(statsInterval)

  console.log(indexName, stats)
}
