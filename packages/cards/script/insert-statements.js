#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { hotness } = require('@orbiting/backend-modules-discussions')

PgDb.connect().then(async pgdb => {
  const cards = await pgdb.public.cards.findAll()
  const groups = await pgdb.public.cardGroups.findAll()

  await Promise.each(cards, async (card) => {
    const { payload } = card

    const identifier = payload.meta.userId
    const name = [payload.meta.firstName, payload.meta.lastName].join(' ')
    const statement = payload.statement

    if (!statement) {
      return
    }

    const transaction = await pgdb.transactionBegin()

    try {
      const { discussionId } = groups.find(group => group.id === card.cardGroupId)

      if (!card.commentId) {
        console.log(`Handling statement of Card "${name}" (ID: "${identifier}")...`)

        const comment = await transaction.public.comments.insertAndGet({
          discussionId,
          userId: card.userId,
          content: statement.trim(),
          hotness: hotness(0, 0, (new Date().getTime())),
          createdAt: card.updatedAt,
          updatedAt: card.updatedAt
        })

        await transaction.public.cards.updateOne(
          { id: card.id },
          { commentId: comment.id }
        )
      }

      const credentials = await transaction.public.credentials.find({ isListed: true })

      const discussionPreference = await transaction.public.discussionPreferences.findOne(
        { discussionId, userId: card.userId }
      )

      if (!discussionPreference) {
        await transaction.public.discussionPreferences.insert({
          discussionId,
          userId: card.userId,
          credentialId: credentials
            .find(credential => credential.userId === card.userId)
            .id,
          notificationOption: 'MY_CHILDREN',
          anonymous: false
        })
      }

      await transaction.transactionCommit()
    } catch (e) {
      await transaction.transactionRollback()
      console.warn(e)
    }
  })

  await pgdb.close()
})
