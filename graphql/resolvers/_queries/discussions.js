const getDiscussion = require('./discussion')

module.exports = async (_, args, { pgdb }, info) => {
  return pgdb.public.discussions.find()
    .then(discussions => discussions
      .map(discussion => getDiscussion(
        null,
        { id: discussion.id },
        { pgdb },
        info
      ))
    )
}
