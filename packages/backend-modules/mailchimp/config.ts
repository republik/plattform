import { z } from 'zod'

const configSchema = z.object({
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY: z.string(),
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY: z.string(),
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR: z.string(),
  MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE: z.string(),
  MAILCHIMP_INTEREST_NEWSLETTER_WDWWW: z.string(),
  MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY: z.string(),
  MAILCHIMP_INTEREST_NEWSLETTER_BAB: z.string(),
  MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE: z.string(),
  MAILCHIMP_INTEREST_MEMBER: z.string(),
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR: z.string(),
  MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL: z.string(),
  MAILCHIMP_MAIN_LIST_ID: z.string(),
  MAILCHIMP_ONBOARDING_AUDIENCE_ID: z.string(),
  MAILCHIMP_MARKETING_AUDIENCE_ID: z.string(),
  MAILCHIMP_PROBELESEN_AUDIENCE_ID: z.string(),
  MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID: z.string(),
  MAILCHIMP_INTEREST_PLEDGE: z.string(),
  MAILCHIMP_INTEREST_GRANTED_ACCESS: z.string(),
  MAILCHIMP_MARKETING_INTEREST_FREE_OFFERS_ONLY: z.string(),
  REGWALL_TRIAL_CAMPAIGN_ID: z.string(),
})

export function getConfig() {
  const result = configSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('\n')
    throw new Error(`Configuration validation failed:\n${errors}`)
  }

  return result.data
}
