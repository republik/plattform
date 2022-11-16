const { getConsentLink } = require('../../../lib/Newsletter')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

module.exports = async (_, args, context) => {
  const { email, name, context: newsletterContext } = args
  const { t } = context

  if (!['PROJECTR', 'CLIMATE', 'READALOUD', 'WINTER'].includes(name)) {
    throw new Error(t('api/newsletters/request/notSupported'))
  }

  const { status } = await sendMailTemplate(
    {
      to: email,
      subject: t(`api/newsletters/request/${name}/subject`),
      templateName: `newsletter_request_${name}`,
      globalMergeVars: [
        {
          name: 'CONFIRM_LINK',
          content: getConsentLink(email, name, newsletterContext),
        },
      ],
    },
    context,
  )

  return status === 'SENT'
}
