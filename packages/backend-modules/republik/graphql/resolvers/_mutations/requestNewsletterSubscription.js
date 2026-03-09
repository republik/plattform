const validator = require('validator')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const {
  getNewsletterSubscriptionConfig,
} = require('@orbiting/backend-modules-mailchimp')

const { getConsentLink } = require('../../../lib/Newsletter')

module.exports = async (_, args, context) => {
  const { email, name, context: newsletterContext } = args
  const { t } = context

  if (!validator.isEmail(email)) {
    throw new Error(t('api/email/invalid'))
  }

  const newsletterConfig =
    getNewsletterSubscriptionConfig().MAILCHIMP_NEWSLETTER_CONFIGS.find(
      (config) => config.name === name,
    )

  if (!newsletterConfig?.free) {
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
