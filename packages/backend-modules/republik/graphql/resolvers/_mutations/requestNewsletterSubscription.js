const validator = require('validator')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const { getConsentLink } = require('../../../lib/Newsletter')

module.exports = async (_, args, context) => {
  const { email, name, context: newsletterContext } = args
  const { t } = context

  if (!validator.isEmail(email)) {
    throw new Error(t('api/email/invalid'))
  }

  if (!['PROJECTR', 'CLIMATE', 'WDWWW', 'SUNDAY', 'BAB'].includes(name)) {
    throw new Error(t('api/newsletters/request/notSupported'))
  }

  const { status } = await sendMailTemplate(
    {
      to: email,
      subject: t(`api/newsletters/request/${name}/subject`),
      templateName: `newsletter_request`,
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
