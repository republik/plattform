module.exports = async ({ indexName, elastic, pgdb }) => {
  const stats = { comments: { added: 0, total: 0 } }
  const statsInterval = setInterval(
    () => { console.log(indexName, stats) },
    1 * 1000
  )

  const comments = await pgdb.public.comments.find()

  stats.comments.total = comments.length

  const esDocuments = comments.map(comment => ({
    id: comment.id,
    body: {
      ...comment
    }
  }))

  for (let doc of esDocuments) {
    await elastic.create({
      index: indexName,
      type: 'comments',
      ...doc
    })
    stats.comments.added++
  }

  clearInterval(statsInterval)

  console.log(indexName, stats)
}
