module.exports = {
  user: async (author, args, { pgdb }) => {
    const { email } = author
    return pgdb.public.users.findOne({ email })
  }
}
