const { ensureSignedIn, Roles } = require('@orbiting/backend-modules-auth')
const { grants: grantsLib } = require('@orbiting/backend-modules-access')
const { lib: { Portrait } } = require('@orbiting/backend-modules-assets')
const { publish } = require('@orbiting/backend-modules-slack')

const { upsertStatement } = require('../../../lib/cards')

const { ADMIN_FRONTEND_BASE_URL, CLAIM_CARD_CAMPAIGN, SLACK_CHANNEL_FEED } = process.env

module.exports = async (
  _,
  { id, portrait, statement, payload },
  context
) => {
  const { req, user, pgdb, t, mail } = context
  ensureSignedIn(req)

  const transaction = await pgdb.transactionBegin()
  const now = new Date()

  try {
    const card = await transaction.public.cards.findOne({ id, userId: user.id })
    if (!card) {
      throw new Error(t('api/cards/updateCard/cardNotFound'))
    }

    if (portrait !== undefined) {
      const portraitUrl = portrait ? await Portrait.upload(portrait) : null
      await transaction.public.users.update(
        { id: user.id },
        {
          portraitUrl: portraitUrl,
          updatedAt: now
        }
      )
    }

    const updatedPayload = {
      ...card.payload,
      statement,
      ...payload.financing !== undefined && {
        financing: payload.financing || {}
      },
      ...payload.campaignBudget !== undefined && {
        campaignBudget: (payload.campaignBudget && Number(payload.campaignBudget)) || null
      },
      ...payload.campaignBudgetComment !== undefined && {
        campaignBudgetComment: payload.campaignBudgetComment || ''
      },
      ...payload.vestedInterests !== undefined && {
        vestedInterests: payload.vestedInterests.map(({ name, entity, position }) => ({
          name: (name && String(name)) || '',
          entity: (entity && String(entity)) || '',
          position: (position && String(position)) || ''
        }))
      }
    }

    await transaction.public.cards.update(
      { id },
      {
        payload: updatedPayload,
        updatedAt: now
      }
    )

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
      await publish(
        SLACK_CHANNEL_FEED,
        [
          `:pencil2: *updateCard* Card von *${[card.payload.meta.firstName, card.payload.meta.lastName].join(' ')}*`,
          `_Republik Card ID: ${card.id}, Smartvote ID: ${card.payload.meta.userId}_`,
          `durch *<${ADMIN_FRONTEND_BASE_URL}/users/${user.id}|${[user.firstName, user.lastName].join(' ')}>*`,
          statement && `Statement: «${statement.replace(/\n/g, ' ').slice(0, 250)}»`,
          user._raw.portraitUrl && `<${user._raw.portraitUrl}|${portrait ? 'neue ' : ''}Portrait-URL>`
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
        `:small_red_triangle: *updateCard (Fehler)*`,
        e.message,
        user && `durch *<${ADMIN_FRONTEND_BASE_URL}/users/${user.id}|${[user._raw.firstName, user._raw.lastName].join(' ')}>*`,
        `_Republik Card ID: ${id}_`
      ].filter(Boolean).join('\n')
    )

    throw e
  }
}
