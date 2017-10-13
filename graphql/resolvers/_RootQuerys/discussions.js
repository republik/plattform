module.exports = async (_, args, { pgdb }) => {
  return pgdb.public.discussions.find()
}
