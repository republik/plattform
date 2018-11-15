module.exports = async (_, args, { pgdb }) =>
  pgdb.public.discussions.find({ hidden: false })
