const { z } = require('zod')
const { t } = require('@orbiting/backend-modules-translate')
const {
  trackSignupRequest,
  uuidToRef,
} = require('@orbiting/backend-modules-lead-tracking')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const {
  getNewsletterSubscriptionConfig,
} = require('@orbiting/backend-modules-mailchimp')

const { getConsentLink } = require('../../../lib/Newsletter')

const { MAILCHIMP_NEWSLETTER_CONFIGS } = getNewsletterSubscriptionConfig()

const freeNewsletters = MAILCHIMP_NEWSLETTER_CONFIGS.filter((c) => c.free).map(
  (config) => config.name,
)

/**
 * @typedef {z.infer<typeof ArgsSchema>} Args
 */
const ArgsSchema = z.object({
  email: z.string().email(t('api/email/invalid')),
  name: z.enum(freeNewsletters, {
    errorMap: () => ({ message: t('api/newsletters/request/notSupported') }),
  }),
  context: z.string(),
  meta: z.record(z.any()).optional().default({}),
})
/**
 *
 * @param {never} _
 * @param {Args} args
 * @param {import('@orbiting/backend-modules-types').GraphqlContext} context
 * @returns
 */
module.exports = async (_, args, context) => {
  const result = ArgsSchema.safeParse(args)

  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join('\n')
    throw new Error(message)
  }
  const { email, name, meta } = result.data

  const { id: ref_id } = await trackSignupRequest(context.pgdb, name, meta)

  const { status } = await sendMailTemplate(
    {
      to: email,
      subject: t(`api/newsletters/request/${name}/subject`),
      templateName: `newsletter_request`,
      globalMergeVars: [
        {
          name: 'CONFIRM_LINK',
          content: getConsentLink(email, name, uuidToRef(ref_id)),
        },
      ],
    },
    context,
  )

  return status === 'SENT'
}
