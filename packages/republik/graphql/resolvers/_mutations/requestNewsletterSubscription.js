const { authenticate } = require('../../../lib/Newsletter')
const base64u = require('@orbiting/backend-modules-base64u')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const { FRONTEND_BASE_URL } = process.env

module.exports = async (_, args, context) => {
  const { email, name, context: newsletterContext } = args
  const { t } = context

  if (!['COVID19'].includes(name)) {
    throw new Error(t('api/newsletters/request/notSupported'))
  }

  const mac = authenticate(email, name, true, t)

  const confirmLink = `${FRONTEND_BASE_URL}/mitteilung?type=newsletter&name=${name}&subscribed=1&email=${base64u.encode(
    email,
  )}&mac=${mac}&context=${newsletterContext}`

  const { status } = await sendMailTemplate(
    {
      to: email,
      subject: t(`api/newsletters/request/${name}/subject`),
      templateName: `newsletter_request_${name}`,
      globalMergeVars: [
        {
          name: 'CONFIRM_LINK',
          content: confirmLink,
        },
      ],
    },
    context,
  )

  return status === 'SENT'
}
