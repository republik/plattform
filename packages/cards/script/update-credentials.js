#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

Promise.props({ pgdb: PgDb.connect() }).then(async (connections) => {
  const { pgdb } = connections

  const cards = await pgdb.public.cards.findAll()
  const users = await pgdb.public.users.find({ id: cards.map(card => card.userId) })
  const credentials = await pgdb.public.credentials.find({ userId: users.map(user => user.id) })

  console.log({
    cards: cards.length,
    users: users.length,
    credentials: credentials.length
  })

  await Promise.each(cards, async card => {
    const { payload } = card
    const now = new Date()

    const electNationalCouncil = payload.nationalCouncil.elected
    const electCouncilOfStates = payload.councilOfStates.elected

    const candidateNationalCouncil = payload.nationalCouncil.candidacy
    const candidateCouncilOfStates = payload.councilOfStates.candidacy

    const title = (
      (electNationalCouncil && !electCouncilOfStates && 'in den Nationalrat gewählt') ||
      (electCouncilOfStates && 'in den Ständerat gewählt') ||

      (candidateNationalCouncil && candidateCouncilOfStates && 'National- und Ständeratskandidatur') ||
      (candidateNationalCouncil && !candidateCouncilOfStates && 'Nationalratskandidatur') ||
      (!candidateNationalCouncil && candidateCouncilOfStates && 'Ständeratskandidatur')
    )

    const user = users.find(user => user.id === card.userId)
    const userCredentials = credentials.filter(credential => credential.userId === user.id)

    const existingCredential = userCredentials.length > 0 && userCredentials.find(credential => credential.description === title)

    if (existingCredential) {
      if (!existingCredential.isListed || !existingCredential.verified) {
        console.log(`Verify and list «${title}»...`)

        await pgdb.public.credentials.update(
          { 'id !=': existingCredential.id, userId: user.id },
          { isListed: false, updatedAt: now }
        )

        await pgdb.public.credentials.update(
          { id: existingCredential.id },
          { isListed: true, verified: true, updatedAt: now }
        )
      }
    } else {
      console.log(`Insert verified and listed «${title}»...`)

      await pgdb.public.credentials.update(
        { userId: user.id },
        { isListed: false, updatedAt: now }
      )

      await pgdb.public.credentials.insert({
        userId: user.id,
        description: title,
        isListed: true,
        verified: true,
        createdAt: now,
        updatedAt: now
      })
    }
  })

  return connections
})
  .then(async ({ pgdb }) => {
    await PgDb.disconnect(pgdb)
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
