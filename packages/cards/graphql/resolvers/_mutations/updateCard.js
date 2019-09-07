const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { lib: { Portrait } } = require('@orbiting/backend-modules-assets')

module.exports = async (
  _,
  { id, portrait, statement, payload },
  context
) => {
  const { req, user, pgdb } = context
  ensureSignedIn(req)

  console.log({ id, portrait: portrait && portrait.length, statement, payload })

  const transaction = await pgdb.transactionBegin()
  const now = new Date()

  try {
    const card = await transaction.public.cards.findOne({ id, userId: user.id })
    if (!card) {
      throw new Error('api/cards/updateCard/cardNotFound')
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
        userId: user.id,
        updatedAt: now
      }
    )

    await transaction.transactionCommit()

    return pgdb.public.cards.findOne({ id })
  } catch (e) {
    await transaction.transactionRollback()

    throw e
  }
}
