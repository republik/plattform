module.exports = async (_, args, { user, pgdb }) => {
  if (!user) {
    return user
  }

  return {
    ...user,
    publicUser: user
  }
}
