const nodemailer = require('nodemailer')

const { SendMailError } = require('./errors')

const transporter = nodemailer.createTransport(process.env.SEND_MAILS_NODEMAILER_CONNECTION_URL)

const {
  SEND_MAILS_NODEMAILER_CONNECTION_URL,
  SEND_MAILS_NODEMAILER_REGEX
} = process.env

module.exports = () => {
  return {
    isUsable (mail) {
      return (
        SEND_MAILS_NODEMAILER_CONNECTION_URL &&
        SEND_MAILS_NODEMAILER_REGEX &&
        new RegExp(SEND_MAILS_NODEMAILER_REGEX, 'ig').test(mail.templateName)
      )
    },
    async send (message, templateName, templateContent) {
      const result = await new Promise(function (resolve, reject) {
        // Default to an empty array so Array.reduce will return initial value
        const variables = message.global_merge_vars || []

        transporter.sendMail(
          {
            from: `"${message.from_name}" <${message.from_email}>`,
            to: message.to.map(({ email }) => email).join(', '),
            subject: message.subject,
            text: message.text && variables.reduce(
              (template, mergeVar) => {
                const { name, content } = mergeVar
                return template.replace(new RegExp(`{?{{ ?${name} ?}}}?`, 'ig'), content)
              },
              message.text
            ),
            html: message.html && variables.reduce(
              (template, mergeVar) => {
                const { name, content } = mergeVar
                return template.replace(new RegExp(`{?{{ ?${name} ?}}}?`, 'ig'), content)
              },
              message.html
            )
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
