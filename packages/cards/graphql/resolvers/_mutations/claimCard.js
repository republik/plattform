const {
  ensureSignedIn,
  AccessToken: { getUserByAccessToken },
  Roles
} = require('@orbiting/backend-modules-auth')
const { lib: { Portrait } } = require('@orbiting/backend-modules-assets')
const { grants: grantsLib } = require('@orbiting/backend-modules-access')
const { Redirections } = require('@orbiting/backend-modules-redirections')

const { CLAIM_CARD_CAMPAIGN } = process.env

module.exports = async (
  _,
  { id, accessToken, portrait, statement },
  context
) => {
  const { req, user, pgdb, t, mail } = context
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

    if (tokenUser.id !== user.id && tokenUser.verified) {
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
        payload: { ...card.payload, statement },
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
          hasPublicProfile: true,
          portraitUrl: portraitUrl || tokenUser._raw.portraitUrl || user._raw.portraitUrl,
          isListed: true,
          facebookId: user._raw.facebookId || tokenUser._raw.facebookId,
          twitterHandle: user._raw.twitterHandle || tokenUser._raw.twitterHandle,
          publicUrl: user._raw.publicUrl || tokenUser._raw.publicUrl,
          updatedAt: now
        }
      )

      if (user._raw.username && user._raw.username !== tokenUser._raw.username) {
        try {
          await Redirections.add({
            source: `/~${tokenUser._raw.username}`,
            target: `/~${user._raw.username}`,
            resource: { user: { id: user.id } }
          }, transaction)
        } catch (e) {
          // Slack unable to setup redirect
        }
      }

      // @TODO: Move followers/follows from tokenUser to user
    }

    // @TODO Insert statement into discussion

    if (CLAIM_CARD_CAMPAIGN) {
      try {
        await grantsLib.request(user, CLAIM_CARD_CAMPAIGN, t, transaction, mail)
        await Roles.addUserToRole(user.id, 'debater', transaction)
      } catch (e) {
        // Slack unable to request trial
      }
    }

    await transaction.transactionCommit()

    return pgdb.public.cards.findOne({ id })
  } catch (e) {
    await transaction.transactionRollback()

    throw e
  }
}
