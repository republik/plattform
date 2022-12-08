const nodemailer = require('nodemailer')

const { SendMailError } = require('./errors')

const {
  SEND_MAILS_NODEMAILER_CONNECTION_URL,
  SEND_MAILS_NODEMAILER_TEMPLATE_REGEX,
} = process.env

const transporter =
  !!SEND_MAILS_NODEMAILER_CONNECTION_URL &&
  nodemailer.createTransport(process.env.SEND_MAILS_NODEMAILER_CONNECTION_URL)

module.exports = () => {
  return {
    isUsable(mail) {
      return !!(
        transporter &&
        SEND_MAILS_NODEMAILER_TEMPLATE_REGEX &&
        new RegExp(SEND_MAILS_NODEMAILER_TEMPLATE_REGEX, 'ig').test(
          mail.templateName,
        )
      )
    },
    async send(message) {
      const result = await new Promise(function (resolve, reject) {
        transporter.sendMail(
          {
            from: `"${message.from_name}" <${message.from_email}>`,
            to: message.to.map(({ email }) => email).join(', '),
            subject: message.subject,
            text: message.text,
            html: message.html,
            attachments: message?.attachments?.map((attachment) => ({
              filename: attachment.name,
              content: attachment.content,
              contentType: attachment.type,
              encoding: 'base64',
            })),
          },
          (error, info) => {
            if (error) {
              reject(new SendMailError(error))
            } else {
              resolve({ ...info, status: 'sent' })
            }
          },
        )
      })

      return [result]
    },
  }
}
