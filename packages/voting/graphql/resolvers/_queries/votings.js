module.exports = async (_, args, context) => {
  const {
    id,
    path,
    repoId
  } = args

  console.log('votings.js', id, path, repoId)

  return []
}
