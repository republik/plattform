module.exports = async (_, args, {pgdb, user}) => {
  if (!user) {
    return []
  }
  return pgdb.public.pledges.find({userId: user.id})
}
