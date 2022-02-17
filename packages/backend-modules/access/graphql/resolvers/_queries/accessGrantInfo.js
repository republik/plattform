const transformUser = require('@orbiting/backend-modules-auth/lib/transformUser')

module.exports = async (_, { id }, { pgdb }) => {
  const accessGrant = await pgdb.public.accessGrants.findOne({ id: id })
  if (accessGrant) {
    const granter = await pgdb.public.users.findOne({
      id: accessGrant.granterUserId,
    })

    if (granter) {
      const safeGranter = transformUser(granter, {
        portraitUrl: granter.portraitUrl,
      })

      return {
        granterName: safeGranter.name,
        granterPortrait: safeGranter.portraitUrl,
        message: accessGrant.message,
      }
    }
  }
  return null
}
