const { sendMail } = require('@orbiting/backend-modules-mail') // holt nur was in {} verlangt wurde

const {
  CS_INHERITANCE_TO,
  CS_INHERITANCE_SUBJECT
} = process.env

module.exports = (_, args, context) => {
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
