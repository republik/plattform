#!/usr/bin/env node
// seed a questionnaire with random answers

require('@orbiting/backend-modules-env').config()
const Promise = require('bluebird')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Questionnaire = require('@orbiting/backend-modules-voting/lib/Questionnaire')
const submitAnswer = require('@orbiting/backend-modules-voting/graphql/resolvers/_mutations/submitAnswer')
const moment = require('moment')
const uuid = require('uuid/v4')
const { t } = require('@orbiting/backend-modules-translate')
const { loaderBuilders } = require('../../../../servers/republik/server')

const getRandomUsers = (questionnaireId, limit, pgdb) =>
  pgdb.query(`
    SELECT u.*
    FROM users u
    WHERE
      u.id NOT IN (
        SELECT "userId"
        FROM answers a
        WHERE
          a."questionnaireId" = :questionnaireId
      )
      AND u.roles @> '["member"]'
    LIMIT :limit
  `, {
    questionnaireId,
    limit
  })

const createGraphQLContext = (defaultContext) => {
  const loaders = {}
  const context = {
    ...defaultContext,
    t,
    loaders
  }
  Object.keys(loaderBuilders).forEach(key => {
    loaders[key] = loaderBuilders[key](context)
  })
  return context
}

PgDb.connect().then(async pgdb => {
  const slug = process.argv[2]
  const numUsers = parseInt(process.argv[3]) || 120

  if (!slug) {
    throw new Error('first parameter must be the questionnaire slug to seed')
  }

  const context = createGraphQLContext({ pgdb })

  const questionnaire = await Questionnaire.findBySlug(slug, pgdb)
  if (!questionnaire) {
    throw new Error(`questionnaire with slug (${slug}) not found`)
  }

  const questions = await Questionnaire.getQuestions(questionnaire, {}, pgdb)

  const timeCount = 4
  const timeUnit = 'hours'
  const now = moment()

  const startTime = moment(now).subtract(timeCount, timeUnit)

  const numSeconds = moment(now).diff(startTime, 'seconds')

  const users = await getRandomUsers(questionnaire.id, numUsers, pgdb)
  /* const usersStartDate = */users.reduce(
    (agg, { id }) => {
      const offsetSecs = Math.round(Math.random() * numSeconds)
      agg[id] = moment(startTime).add(offsetSecs, 'seconds').toDate()
      return agg
    },
    {}
  )

  /*
  const answerValues = '1111010000'

  const bias1 = '1111100000'
  const bias2 = '0000011111'
  const getBias = (qIndex) => bias2.charAt(qIndex)
  */

  await Promise.each(
    questions,
    (q, qIndex) => {
      const bias = Math.round(Math.random())
      const getBias = () => bias

      return Promise.each(
        users,
        (user) => {
          const { id: userId } = user

          // bias
          const optionIndex = Math.round(Math.random() * 4) !== 4
            ? getBias(qIndex) // bias
            : Math.round(Math.random())

          // totaly random
          // const optionIndex = Math.round(Math.random())

          // const option = q.options[optionIndex]
          const option = q.options[optionIndex]

          // fixed
          // const fixedValue = answerValues.charAt(qIndex) === '1' ? 'true' : 'false'

          /*
          return pgdb.public.answers.insert({
            questionId: q.id,
            questionnaireId: questionnaire.id,
            userId,
            payload: { value: [option.value] },
            //payload: { value: [fixedValue] },
            submitted: true,
            createdAt: moment(usersStartDate[userId]).add(qIndex * 2, 'seconds').toDate()
          })
          */

          return submitAnswer(
            null,
            {
              answer: {
                id: uuid(),
                questionId: q.id,
                userId,
                payload: { value: [option.value] }
              }
            },
            {
              ...context,
              user,
              req: { user }
            }
          )
        }
      )
    }
  )

  console.log('finished')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
