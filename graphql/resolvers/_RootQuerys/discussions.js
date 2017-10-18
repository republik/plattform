module.exports = async (_, args, { pgdb }) => {
  return pgdb.public.discussions.find()
    .then(discussions => discussions
      .map(discussion => ({
        ...discussion,
        _id: discussion.id
      }))
    )
}
