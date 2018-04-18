module.exports = async (_, args, { pgdb }, info) =>
  pgdb.public.discussions.find()
