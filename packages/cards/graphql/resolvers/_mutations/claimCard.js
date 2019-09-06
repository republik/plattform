const { ensureSignedIn, AccessToken: { getUserByAccessToken } } = require('@orbiting/backend-modules-auth')
const { lib: { Portrait } } = require('@orbiting/backend-modules-assets')

module.exports = async (
  _,
  { id, accessToken, portrait, statement },
  context
) => {
  const { req, user, pgdb } = context
  ensureSignedIn(req)

  const tokenUser = await getUserByAccessToken(accessToken, context)
  if (!tokenUser) {
    throw new Error('api/cards/claimCard/userViaTokenNotFound')
  }

  const transaction = await pgdb.transactionBegin()
  const now = new Date()

  try {
    const card = await transaction.public.cards.findOne({ id, userId: tokenUser.id })
    if (!card) {
      throw new Error('api/cards/claimCard/cardNotFound')
    }

    if (tokenUser.verified) {
      throw new Error('api/cards/claimCard/cardOwnerVerified')
    }

    const hasExistingCards = !!(await transaction.public.cards.count({
      userId: user.id,
      'id !=': id
    }))
    if (hasExistingCards) {
      throw new Error('api/cards/claimCard/targetHasAlreadyCards')
    }

    const portraitUrl = portrait ? await Portrait.upload(portrait) : null

    await transaction.public.cards.update(
      { id },
      {
        userId: user.id,
        updatedAt: now
      }
    )

    if (user.id !== tokenUser.id) {
      // bisheriger tokenUser
      await transaction.public.users.update(
        { id: tokenUser.id },
        {
          firstName: null,
          lastName: null,
          username: null,
          roles: null,
          hasPublicProfile: false,
          portraitUrl: null,
          isListed: false,
          facebookId: null,
          twitterHandle: null,
          publicUrl: null,
          deletedAt: now,
          updatedAt: now
        }
      )

      await transaction.public.users.update(
        { id: user.id },
        {
          firstName: user._raw.firstName || tokenUser._raw.firstName,
          lastName: user._raw.lastName || tokenUser._raw.lastName,
          username: user._raw.username || tokenUser._raw.username,
          roles: Array.from(
            new Set([].concat(user._raw.roles).concat(tokenUser._raw.roles).filter(Boolean))
          ),
          hasPublicProfile: true,
          portraitUrl: portraitUrl || tokenUser._raw.portraitUrl || user._raw.portraitUrl,
          isListed: true,
          facebookId: user._raw.facebookId || tokenUser._raw.facebookId,
          twitterHandle: user._raw.twitterHandle || tokenUser._raw.twitterHandle,
          publicUrl: user._raw.publicUrl || tokenUser._raw.publicUrl,
          updatedAt: now
        }
      )

      // @TODO: If user.username && tokenUser.username !== user.username
      // -> insert redirect

      // @TODO: Move followers/follows from tokenUser to user
    }

    // @TODO Insert statement into discussion

    await transaction.transactionCommit()

    return pgdb.public.cards.findOne({ id })
  } catch (e) {
    await transaction.transactionRollback()

    throw e
  }
}
