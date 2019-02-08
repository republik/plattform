const { sendMail } = require('@orbiting/backend-modules-mail') // holt nur was in {} verlangt wurde
const { ensureStringLength } = require('@orbiting/backend-modules-utils')

const {
  CS_INHERITANCE_TO,
  CS_INHERITANCE_SUBJECT
} = process.env

module.exports = (_, args, context) => {
  // const { t } = context
  const {
    email,
    tel,
    content
  } = args

  ensureStringLength(content, { max: 2000 })
  // throw new Error(t('api/email/invalid'))

  const emailText = `Neue Meldung eingegangen
Von:
\temail: ${email}
${tel ? '\ttel: ' + tel : ''}

${args.content}
`

  sendMail({
    to: CS_INHERITANCE_TO,
    subject: CS_INHERITANCE_SUBJECT,
    text: emailText
  }, context)

  return true
}
