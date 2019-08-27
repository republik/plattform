#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const faker = require('faker/locale/de_CH')
const { slug } = require('@project-r/styleguide/lib/lib/slug')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const minMaxInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const probableTrue = (probability) => Math.random() < probability

const deck = []

const names = [
  'Zürich',
  'Bern',
  'Luzern',
  'Uri',
  'Schwyz',
  'Obwalden',
  'Nidwalden',
  'Glarus',
  'Zug',
  'Freiburg',
  'Solothurn',
  'Basel-Stadt',
  'Basel-Landschaft',
  'Schaffhausen',
  'Appenzell Ausserrhoden',
  'Appenzell Innerrhoden',
  'St. Gallen',
  'Graubünden',
  'Aargau',
  'Thurgau',
  'Tessin',
  'Waadt',
  'Wallis',
  'Neuenburg',
  'Genf',
  'Jura'
]

const getInteressebindungen = () => {
  const Interessenbindungen = []
  const max = probableTrue(0.5) && minMaxInteger(0, 10)
  if (max) {
    for (let i = 0; i < max; i++) {
      Interessenbindungen.push(
        { entity: faker.lorem.words(), function: faker.name.jobTitle() }
      )
    }
  }

  return Interessenbindungen
}

const getWahlkampfbudget = () => {
  if (probableTrue(0.25)) {
    return minMaxInteger(1, 1000) * 1000
  }

  return null
}

const getRandomEntity = (entities) => {
  return { id: entities[minMaxInteger(0, entities.length - 1)].id }
}

PgDb.connect().then(async pgdb => {
  const hasMockCards = !!(await pgdb.public.gsheets.count({ name: 'cards/mockCards' }))
  if (!hasMockCards) {
    await pgdb.public.gsheets.insert({
      name: 'cards/mockCards',
      data: []
    })
  }

  const hasMockCardGroups = !!(await pgdb.public.gsheets.count({ name: 'cards/mockCardGroups' }))
  if (!hasMockCardGroups) {
    await pgdb.public.gsheets.insert({
      name: 'cards/mockCardGroups',
      data: []
    })
  }

  const discussions = await pgdb.query(`
    SELECT id FROM discussions d
    WHERE d.closed = FALSE
  `)

  const users = await pgdb.query(`
    SELECT id FROM users u
    WHERE
      u.verified = TRUE
      AND u."firstName" IS NOT NULL
      AND u."hasPublicProfile" = TRUE
      AND u."isListed" = TRUE
      AND u."email" LIKE '%@republik.ch'
  `)

  /**
   * CardGroup
   */
  console.log(`Generiere CardGroups-Einträge zu Testzwecken...`)

  const groups = names.map(name => ({
    id: faker.random.uuid(),
    name,
    slug: slug(name),
    discussion: getRandomEntity(discussions)
  }))

  await pgdb.public.gsheets.updateOne(
    { name: 'cards/mockCardGroups' },
    { data: groups, updatedAt: new Date() }
  )

  console.log('Done.')

  /**
   * Cards
   */
  const amount = minMaxInteger(4000, 4500)

  console.log(`Generiere ${amount} Card-Einträge zu Testzwecken...`)

  for (let card = 0; card < amount; card++) {
    if (card % 100 === 1) {
      console.log(`... bei Card Nr. ${card}`)
    }

    const campaignBudget = getWahlkampfbudget()

    deck.push({
      id: faker.random.uuid(),
      payload: {
        yearOfBirth: minMaxInteger(1930, 2001),
        occupation: faker.name.jobTitle(),
        listNumber: `${minMaxInteger(1, 20)}.${minMaxInteger(1, 10)}`,
        listName: faker.lorem.words(),
        party: faker.lorem.words(),
        highPotential: Math.random() >= 0.5,
        smartvoteCohorts: [{ a: 1 }],
        vestedInterestsSmartvote: getInteressebindungen(),
        vestedInterestsLobbywatch: getInteressebindungen(),
        campaignBudget,
        campaignBudgetComment: campaignBudget && faker.lorem.sentence(),
        candidacies:
          probableTrue(0.8)
            ? ['National Council']
            : probableTrue(0.5)
              ? ['Council of States']
              : ['Council of States', 'National Council']
      },
      group: await getRandomEntity(groups),
      user: await getRandomEntity(users),
      documents: {
        totalCount: 0,
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
          hasPreviousPage: false,
          startCursor: null
        },
        nodes: []
      },
      match: null,
      totalMatches: minMaxInteger(0, 10000)
    })
  }

  await pgdb.public.gsheets.updateOne(
    { name: 'cards/mockCards' },
    { data: deck, updatedAt: new Date() }
  )

  console.log('Done.')

  await pgdb.close()
})
