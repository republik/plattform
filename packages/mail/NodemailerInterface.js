const nodemailer = require('nodemailer')

const { SendMailError } = require('./errors')

const {
  SEND_MAILS_NODEMAILER_CONNECTION_URL,
  SEND_MAILS_NODEMAILER_TEMPLATE_REGEX
} = process.env

const transporter =
  !!SEND_MAILS_NODEMAILER_CONNECTION_URL &&
  nodemailer.createTransport(process.env.SEND_MAILS_NODEMAILER_CONNECTION_URL)

const compile = (template, variables = []) => {
  if (!template) {
    return undefined
  }

  return variables.reduce(
    (string, mergeVar) => {
      const { name, content } = mergeVar
      return string.replace(new RegExp(`{?{{ ?${name} ?}}}?`, 'ig'), content)
    },
    template
  )
}

module.exports = () => {
  return {
    isUsable (mail) {
      return !!(
        transporter &&
        SEND_MAILS_NODEMAILER_TEMPLATE_REGEX &&
        new RegExp(SEND_MAILS_NODEMAILER_TEMPLATE_REGEX, 'ig').test(mail.templateName)
      )
    },
    async send (message) {
      const result = await new Promise(function (resolve, reject) {
        transporter.sendMail(
          {
            from: `"${message.from_name}" <${message.from_email}>`,
            to: message.to.map(({ email }) => email).join(', '),
            subject: message.subject,
            text: compile(message.text, message.global_merge_vars),
            html: compile(message.html, message.global_merge_vars)
          },
          (error, info) => {
            if (error) {
              reject(new SendMailError(error))
            } else {
              resolve({ ...info, status: 'sent' })
            }
          }
        )
      })

      return [result]
    }
  }
}
