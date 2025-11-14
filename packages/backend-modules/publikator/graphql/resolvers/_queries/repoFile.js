module.exports = async (_, args, context) => {
  const { id } = args
  const { loaders } = context

  const file = await loaders.File.byId.load(id)
  return file
}

