const { ensureSignedIn, Roles } = require('@orbiting/backend-modules-auth')

const { getPhase } = require('../../../lib/phases')

module.exports = async (_, args, context) => {
  const { user: me, loaders, req } = context
  ensureSignedIn(req)

  const repo = await loaders.Repo.byId.load(args.id)
  if (!repo) {
    return null
  }

  const phase = getPhase(repo.currentPhase)
  if (!phase) {
    throw new Error(`repo "${args.id}" is in unknown phase`)
  }

  if (!phase.predicates?.canAccess) {
    Roles.ensureUserHasRole(me, 'editor')
    return repo
  }

  if (!phase.predicates.canAccess(context)) {
    throw new Error(`repo "${args.id}": inaccessible`)
  }

  return repo
}
