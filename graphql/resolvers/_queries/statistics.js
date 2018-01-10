module.exports = (_, args, { pgdb }) => {
  return {
    memberCount: async () => {
      const result = await pgdb.public.query(
        'SELECT count(*) FROM memberships, users ' +
          'WHERE memberships."userId"=users.id AND ' +
          "users.email!='jefferson@project-r.construction'"
      )
      return parseInt(result[0].count)
    }
  }
}
