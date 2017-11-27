const {
  getSelectionArgsForField,
  getUUIDForSelectionArgs
} = require('../../../lib/graphql')

module.exports = async (_, args, { pgdb }, info) => {
  const { id } = args
  const discussion = await pgdb.public.discussions.findOne({ id })
  if (discussion && info) {
    const selectionArgs = getSelectionArgsForField(info, 'comments')
    if (Object.keys(selectionArgs).length > 0) {
      discussion._id = getUUIDForSelectionArgs(selectionArgs, discussion.id)
    }
  }
  return discussion
}
