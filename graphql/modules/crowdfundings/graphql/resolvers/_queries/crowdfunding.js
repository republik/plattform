module.exports = async (_, args, {pgdb}) => {
  return pgdb.public.crowdfundings.findOne(args)
}
