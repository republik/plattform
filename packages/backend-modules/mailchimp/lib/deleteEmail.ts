import MailchimpInterface from '../MailchimpInterface'
import { EmailRequiredMailError } from './errors'
const logger = console

export async function deleteEmail({ email }: { email: string }) {
  if (!email) {
    throw new EmailRequiredMailError()
  }

  const mailchimp = MailchimpInterface({ logger })
  const deleted = MailchimpInterface.audiences.map((audienceId) => {
    return mailchimp.deleteMember(email, audienceId)
  })
  return deleted
}

export type DeleteEmailResult = {
  audienceId?: string
  status: number
  ok: boolean
  notMember: boolean
}

/**
 * Deletes the address from every configured audience (each once) and reports
 * per audience what happened. `notMember` (HTTP 404) is the normal answer for
 * audiences the address was never in; anything else with `ok: false` is a
 * real failure.
 */
export async function deleteEmailDetailed({
  email,
}: {
  email: string
}): Promise<DeleteEmailResult[]> {
  if (!email) {
    throw new EmailRequiredMailError()
  }

  const mailchimp = MailchimpInterface({ logger })
  // unset audience env vars would fall back to the main audience (a second,
  // pointless request), so drop them and duplicates
  const audiences = [
    ...new Set(
      (MailchimpInterface.audiences as (string | undefined)[]).filter(
        (id): id is string => !!id,
      ),
    ),
  ]
  return Promise.all(
    audiences.map((audienceId) =>
      mailchimp.deleteMemberDetailed(email, audienceId),
    ),
  )
}
