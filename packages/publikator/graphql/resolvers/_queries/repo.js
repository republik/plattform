const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')

const client = require('../../../lib/cache/search')

module.exports = async (_, args, context) => {
  const { user } = context
  ensureUserHasRole(user, 'editor')

  const { body } = await client.find({
    first: 1,
    id: args.id
  }, context)

  const cachedRepo = body.hits.hits[0]
  if (cachedRepo) {
    // repo.latestPublications must always be fresh
    // otherwise resolvers/Repo latestPublications uses stale information after publishing a new doc
    delete cachedRepo.latestPublications
    return client.mapHit(cachedRepo)
  }

  return {
    id: args.id
  }
}
