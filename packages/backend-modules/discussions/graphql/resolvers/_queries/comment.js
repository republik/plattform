module.exports = async (_, args, context) => {
  const { id } = args
  const { loaders, t } = context

  const comment = await loaders.Comment.byId.load(id)

  if (!comment) {
    throw new Error(t('api/comment/404'))
  }

  return comment
}
