module.exports = (_, args, {pgdb}) => {
  return pgdb.public.crowdfundings.find()
}
