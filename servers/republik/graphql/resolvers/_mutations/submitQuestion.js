const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, {user, req, t, mail: { sendMail, sendMailTemplate }}) => {
  ensureSignedIn(req)

  const { question } = args
  let name = user.firstName ? [' - ', user.firstName, user.lastName].join(' ') : ''

  const mailAddress =
    process.env.QUESTIONS_MAIL_FROM_ADDRESS ||
    process.env.DEFAULT_MAIL_FROM_ADDRESS

  await Promise.all([
    sendMail({
      to: mailAddress,
      fromEmail: mailAddress,
      subject: 'Neue FAQ',
      text: `${user.email}${name} hat folgende Frage gestellt:\n\n${question}`
    }),
    sendMailTemplate({
      to: user.email,
      fromEmail: mailAddress,
      subject: t('api/faq/mail/subject'),
      templateName: 'cf_faq',
      globalMergeVars: [
        { name: 'NAME',
          content: user.name
        },
        { name: 'QUESTION',
          content: question
        }
      ]
    })
  ])
  return {success: true}
}
