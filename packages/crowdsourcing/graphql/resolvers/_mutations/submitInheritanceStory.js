const { sendMail } = require('@orbiting/backend-modules-mail') // holt nur was in {} verlangt wurde
const { ensureStringLength } = require('@orbiting/backend-modules-utils')
const validator = require('validator')

const {
  CS_INHERITANCE_TO,
  CS_INHERITANCE_SUBJECT
} = process.env

module.exports = (_, args, context) => {
  const { t } = context
  const {
    email,
    tel,
    content,
    count,
    inheritanceFrom,
    inheritanceType,
    value,
    inheritanceBattle,
    heritage,
    testament
  } = args

  if (!CS_INHERITANCE_TO || !CS_INHERITANCE_SUBJECT) {
    console.error('CS_INHERITANCE_TO or CS_INHERITANCE_SUBJECT undefined, cannot send mail!')
    throw new Error(t('api/unexpected'))
  }

  ensureStringLength(content, { max: 2000 })
  if (!validator.isEmail(email)) {
    throw new Error(t('api/email/invalid'))
  }

  const emailText = `Von:
\tE-Mail: ${email}
${tel ? '\tTel: ' + tel : ''}

${value ? 'Wert meines Erbteils: ' + value + ' sFr.' : ''}

${inheritanceType ? 'Das habe ich geerbt / werde ich erben: ' + inheritanceType : ''}

${inheritanceFrom ? 'Von wem? ' + inheritanceFrom : ''}

${count ? 'Ich teile mein Erbe (voraussichtlich) mit ' + count + ' Personen' : ''}

${inheritanceBattle ? 'Es gab einen Erbstreit in meiner Familie: ' + inheritanceBattle : ''}

${heritage ? 'Das werde ich mal vererben: ' + heritage : ''}

${testament ? 'Ich habe mein Testament bereits geschrieben: ' + testament : ''}

${content ? 'Erbgeschichte: ' + content : ''}

`

  return sendMail(
    {
      to: CS_INHERITANCE_TO,
      subject: CS_INHERITANCE_SUBJECT,
      text: emailText
    },
    context,
    {
      logMessage: false
    }
  )
}
