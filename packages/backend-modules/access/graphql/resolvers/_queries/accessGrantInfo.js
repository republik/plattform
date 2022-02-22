module.exports = async (_, { id }, { pgdb, t, loaders }) => {
  const accessGrant = await pgdb.public.accessGrants.findOne({
    id,
    beginAt: null,
    invalidatedAt: null,
  })
  if (accessGrant) {
    const granter = await loaders.User.byId.load(accessGrant.granterUserId)
    if (granter) {
      return {
        granter,
        granterName:
          granter.name ||
          t('api/access/resolvers/AccessGrant/tallDarkStranger'),
        message: accessGrant.message,
      }
    }
  }
  return null
}
