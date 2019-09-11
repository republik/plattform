#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

PgDb.connect().then(async pgdb => {
  const cards = await pgdb.public.cards.findAll()

  Promise.each(cards, async card => {
    const { id, payload } = card

    const updatedPayload = {
      ...payload,
      campaignBudgetSmartvote: payload.campaignBudget,
      campaignBudgetCommentSmartvote: payload.campaignBudgetComment
    }

    await pgdb.public.cards.update(
      { id },
      { payload: updatedPayload, updatedAt: new Date() }
    )

    console.log(payload.meta.userId)
  })
})
