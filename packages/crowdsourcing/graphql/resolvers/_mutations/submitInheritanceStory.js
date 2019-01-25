const { sendMail } = require('@orbiting/backend-modules-mail') // holt nur was in {} verlangt wurde
const { ensureStringLength } = require('@orbiting/backend-modules-utils')

const {
  CS_INHERITANCE_TO,
  CS_INHERITANCE_SUBJECT
} = process.env

module.exports = (_, args, context) => {
  // const { t } = context

  ensureStringLength(args.content, { max: 500 })
  // throw new Error(t('api/email/invalid'))

  sendMail({
    to: CS_INHERITANCE_TO,
    subject: CS_INHERITANCE_SUBJECT,
    text: `Neue Meldung eingegangen
Von: ${args.email}
Kategorie: ${args.category}
${args.content}`
  }, context)
  return true
}
