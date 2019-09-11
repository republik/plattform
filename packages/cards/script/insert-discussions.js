#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

PgDb.connect().then(async pgdb => {
  const transaction = await pgdb.transactionBegin()
  const now = new Date()

  try {
    const groups = await transaction.public.cardGroups.findAll()

    await Promise.map(groups, async group => {
      if (group.discussionId) {
        console.log(`CardGroup "${group.name}" has a discussion linked already`)
        return
      }

      console.log(`Creating discussion and linking to CardGroup "${group.name}"...`)

      const discussion = await transaction.public.discussions.insertAndGet({
        title: `Wahltindär: ${group.name}`,
        path: `/wahltindaer/${group.slug}`,

        hidden: true,
        closed: true,
        collapsable: true,
        disableTopLevelComments: true,
        maxLength: null,
        minInterval: null,
        anonymity: 'FORBIDDEN',

        repoId: null,
        tags: null,
        tagRequired: false,

        createdAt: now,
        updatedAt: now
      })

      await transaction.public.cardGroups.updateOne(
        { id: group.id },
        { discussionId: discussion.id, updatedAt: now }
      )
    })

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }

  await pgdb.close()
})
