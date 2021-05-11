const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (user, args, { user: me, loaders }) => {
  const canAccessAll = Roles.userIsMe(user, me) // isMe
  const canAccessNonAnonymous = Roles.userIsInRoles(me, ['admin', 'supporter']) // isMeInternal isMeAdmin
  const canAccessListed = Roles.userIsMeOrProfileVisible(user, me) // hasPublicProfile, isMember

  // credentials are filtered according to access rights
  // i.e. filtering has to follow the order below because depending on
  // how extensive these rights are the returned list of credentials
  // gets smaller
  if (canAccessAll || canAccessNonAnonymous || canAccessListed) {
    const all = await loaders.Credential.byUserId.load(user.id)
    if (canAccessAll) {
      return all
    }
    if (canAccessNonAnonymous) {
      return all.filter(
        (credential) =>
          credential.usedNonAnonymous ||
          (!credential.usedNonAnonymous && !credential.usedAnonymous),
      )
    }
    if (canAccessListed) {
      return all.filter((credential) => credential.isListed)
    }
  }

  return []
}
