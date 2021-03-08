const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { user, loaders } = context
  ensureUserHasRole(user, 'editor')

  const repo = await loaders.Repo.byId.load(args.id)

  if (!repo) {
    throw new Error(`repo "${args.id}" does not exist`)
  }

  return repo
}
