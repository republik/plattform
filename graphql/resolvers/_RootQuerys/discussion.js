module.exports = async (_, args, { pgdb }) => {
  const { id } = args
  return pgdb.public.discussions.findOne({ id })
}
