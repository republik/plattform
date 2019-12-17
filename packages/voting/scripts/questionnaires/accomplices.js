#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { ascending } = require('d3-array')
const { tsvFormat } = require('d3-dsv')

const Questionnaire = require('@orbiting/backend-modules-voting/lib/Questionnaire')

Promise.props({ pgdb: PgDb.connect() }).then(async (connections) => {
  const { pgdb } = connections

  const slug = '1-minute'
  const questionnaire = await Questionnaire.findBySlug(slug, pgdb)
  if (!questionnaire) {
    throw new Error(`questionnaire with slug (${slug}) not found`)
  }

  const questions = await Questionnaire.getQuestions(questionnaire, {}, pgdb)

  const submissions = await pgdb.query(`
    SELECT
      to_json(u.*) as user,
      to_json(addr.*) as address,
      date_trunc('hour', qs."createdAt" at time zone 'Europe/Zurich') AS submitted,
      to_json(array_agg(a.*)) as answers
    FROM
      "questionnaireSubmissions" qs
    JOIN
      answers a ON a."questionnaireId" = qs."questionnaireId" AND a."userId" = qs."userId" AND a.submitted = true
    JOIN
      users u ON u.id = qs."userId"
    LEFT JOIN
      addresses addr ON addr.id = u."addressId"
    WHERE
      qs."questionnaireId" = :questionnaireId
    GROUP BY u.id, addr.id, qs."createdAt"
    ORDER BY qs."createdAt" ASC
  `, {
    questionnaireId: questionnaire.id
  })

  const questionKeys = {
    'Um die Zukunft der Republik sicherzustellen, muss sie bekannter werden, und mehr Menschen müssen sie abonnieren. Helfen Sie mit?': 'support',
    'Auf welchen Kanälen könnten Sie Freunden und Bekannten die Republik empfehlen? Was können Sie sich vorstellen?': 'channels',
    'Die Republik will besser werden: Wollen Sie sich an unserer Was-brauchen-Sie-wirklich-wenn-Sie-nicht-höflich-sein-wollen-Debatte im Februar 2020 beteiligen?': 'Debatte im Februar',
    'Wie dürfen wir Sie kontaktieren?': 'contactVia'
  }

  const data = submissions.map(submission => {
    const answers = submission.answers
      .map(answer => {
        const question = questions.find(q => q.id === answer.questionId)

        return {
          key: questionKeys[question.text],
          question,
          choices: question.type === 'Choice'
            ? answer.payload.value.map(value =>
              question.options.find(o => o.value === value).label
            )
            : undefined,
          text: question.type === 'Text'
            ? answer.payload.value
            : undefined
        }
      })
      .sort((a, b) => ascending(a.question.order, b.question.order))

    const supportAnswer = answers.find(a => a.key === 'support')
    if (!supportAnswer || !supportAnswer.choices.includes('Ja')) {
      return null
    }

    const { user, address } = submission
    const contactAnswer = answers.find(a => a.key === 'contactVia')

    const viaPhone = contactAnswer && (
      contactAnswer.choices.includes('per SMS') ||
      contactAnswer.choices.includes('per Telefon')
    )
    const viaPost = contactAnswer &&
      contactAnswer.choices.includes('per Post')

    return {
      admin: `https://admin.republik.ch/users/${user.id}`,
      mitarbeiter: user.roles && (user.roles.includes('editor') || user.roles.includes('support'))
        ? 'Ja'
        : 'Nein',
      name: [user.firstName, user.lastName].join(' '),
      email: user.email,
      location: address && [address.city, address.country].join(', '),
      postalCode: address && address.postalCode,
      ...questions.reduce(
        (flat, question) => {
          const answer = answers.find(a => a.question === question)
          const key = questionKeys[question.text]
          if (key !== 'support') {
            if (question.type === 'Choice') {
              if (question.typePayload.cardinality) {
                flat[key || question.text] = answer ? answer.choices.join(', ') : ''
              } else {
                question.typePayload.options.forEach(options => {
                  flat[options.label] = answer && answer.choices.includes(options.label)
                    ? 'Ja'
                    : 'Nein'
                })
              }
            } else {
              flat[key || question.text] = answer ? answer.text : ''
            }
          }
          return flat
        },
        {}
      ),
      phone: viaPhone
        ? user.phoneNumber
          ? user.phoneNumber.replace(/^\+/, ' +')
          : 'fehlt'
        : 'nicht erwünscht',
      address: viaPost ? [
        address.name,
        address.line1,
        address.line2,
        [address.postalCode, address.city].join(' '),
        address.country
      ].filter(Boolean).join('\n') : 'nicht erwünscht'
    }
  }).filter(Boolean)

  console.log(tsvFormat(data))

  return connections
})
  .then(async ({ pgdb }) => {
    await PgDb.disconnect(pgdb)
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
