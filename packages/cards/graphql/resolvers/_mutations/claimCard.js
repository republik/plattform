const {
  ensureSignedIn,
  AccessToken: { getUserByAccessToken },
  Roles
} = require('@orbiting/backend-modules-auth')
const { lib: { Portrait } } = require('@orbiting/backend-modules-assets')
const { grants: grantsLib } = require('@orbiting/backend-modules-access')
const { Redirections } = require('@orbiting/backend-modules-redirections')
const { publish } = require('@orbiting/backend-modules-slack')

const { upsertStatement } = require('../../../lib/cards')

const { ADMIN_FRONTEND_BASE_URL, CLAIM_CARD_CAMPAIGN, SLACK_CHANNEL_FEED } = process.env

module.exports = async (
  _,
  { id, accessToken, portrait, statement, payload },
  context
) => {
  const { req, user, pgdb, t, mail } = context
  ensureSignedIn(req)

  const tokenUser = await getUserByAccessToken(accessToken, context)
  if (!tokenUser) {
    throw new Error(t('api/cards/claimCard/userViaTokenNotFound'))
  }

  const transaction = await pgdb.transactionBegin()
  const now = new Date()

  try {
    const card = await transaction.public.cards.findOne({ id, userId: tokenUser.id })
    if (!card) {
      throw new Error(t('api/cards/claimCard/cardNotFound'))
    }

    if (tokenUser.id !== user.id && tokenUser._raw.verified) {
      throw new Error(t('api/cards/claimCard/cardOwnerVerified'))
    }

    const hasExistingCards = !!(await transaction.public.cards.count({
      userId: user.id,
      'id !=': id
    }))
    if (hasExistingCards) {
      throw new Error(t('api/cards/claimCard/targetHasAlreadyCards'))
    }

    const portraitUrl = portrait ? await Portrait.upload(portrait) : null

    await transaction.public.cards.updateAndGet(
      { id },
      {
        payload: {
          ...card.payload,
          statement,
          ...payload && payload.financing !== undefined && {
            financing: payload.financing || {}
          }
        },
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

      await transaction.public.credentials.update(
        { userId: user.id },
        {
          isListed: false,
          updatedAt: now
        }
      )

      await transaction.public.credentials.update(
        { userId: tokenUser.id },
        {
          userId: user.id,
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
          facebookId: user._raw.facebookId || tokenUser._raw.facebookId,
          twitterHandle: user._raw.twitterHandle || tokenUser._raw.twitterHandle,
          publicUrl: user._raw.publicUrl || tokenUser._raw.publicUrl,
          updatedAt: now
        }
      )

      await transaction.public.subscriptions.update(
        { 'userId !=': user.id, objectUserId: tokenUser.id },
        {
          objectUserId: user.id,
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
          console.warn(e)
        }
      }
    }

    if (CLAIM_CARD_CAMPAIGN && !Roles.userIsInRoles(user, ['debater'])) {
      try {
        await grantsLib.request(user, CLAIM_CARD_CAMPAIGN, t, transaction, mail)
        await Roles.addUserToRole(user.id, 'debater', transaction)
      } catch (e) {
        console.warn(e)
      }
    }

    const statementAction = await upsertStatement(card, transaction)

    await transaction.transactionCommit()

    if (statementAction === 'insert') {
      try {
        const updatedCard = await pgdb.public.cards.findOne({ id: card.id })
        if (updatedCard.commentId) {
          const comment = await pgdb.public.comments.findOne({ id: updatedCard.commentId })
          const discussion = await pgdb.public.discussions.findOne({ id: comment.discussionId })
          const { Notifications: { submitComment } } = require('@orbiting/backend-modules-discussions')
          await submitComment(comment, discussion, context)
        }
      } catch (e) {
        console.warn(e)
      }
    }

    try {
      const owner = await pgdb.public.users.findOne({ id: user.id })
      await publish(
        SLACK_CHANNEL_FEED,
        [
          `:fire: *claimCard* Card von *${[card.payload.meta.firstName, card.payload.meta.lastName].join(' ')}*`,
          `_Republik Card ID: ${card.id}, Smartvote ID: ${card.payload.meta.userId}_`,
          `durch *<${ADMIN_FRONTEND_BASE_URL}/users/${owner.id}|${[owner.firstName, owner.lastName].join(' ')}>*`,
          statement && `Statement: «${statement.replace(/\n/g, ' ').slice(0, 250)}»`,
          owner.portraitUrl && `<${owner.portraitUrl}|${portrait ? 'neue ' : ''}Portrait-URL>`
        ].filter(Boolean).join('\n')
      )
    } catch (e) {
      console.warn(e)
    }

    return pgdb.public.cards.findOne({ id })
  } catch (e) {
    await transaction.transactionRollback()

    await publish(
      SLACK_CHANNEL_FEED,
      [
        `:small_red_triangle: *claimCard (Fehler)*`,
        e.message,
        user && `durch *<${ADMIN_FRONTEND_BASE_URL}/users/${user.id}|${[user._raw.firstName, user._raw.lastName].join(' ')}>*`,
        `_Republik Card ID: ${id}_`
      ].filter(Boolean).join('\n')
    )

    throw e
  }
}
