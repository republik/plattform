import { User } from "@orbiting/backend-modules-types"
import MailchimpInterface from "../MailchimpInterface"

export async function resubscribeEmail(user: User, createResubscribeEmailCacheFn, context) {
  const { userId, email, firstName, lastName } = user

  const mailchimp = MailchimpInterface({ console })
  const member = await mailchimp.getMember(email)

  const body: any = {
    email_address: email,
  }

  if (!member) {
    body.status_if_new = MailchimpInterface.MemberStatus.Subscribed
    body.status = MailchimpInterface.MemberStatus.Subscribed
    body.merge_fields = {
      FNAME: firstName || '',
      LNAME: lastName || '',
    }
    await mailchimp.updateMember(email, body)
  } else {
    const cacheLock = createResubscribeEmailCacheFn(userId, context)

    const isLocked = await cacheLock.get()

    if (isLocked && member.status === MailchimpInterface.MemberStatus.Pending) {
      console.warn(`resubscribe email: user ${userId} goes crazy`)
    }

    if (
      !isLocked &&
      member.status === MailchimpInterface.MemberStatus.Pending
    ) {
      body.status = MailchimpInterface.MemberStatus.Unsubscribed
      await mailchimp.updateMember(email, body)
    }

    if (member.status !== MailchimpInterface.MemberStatus.Subscribed) {
      body.status = MailchimpInterface.MemberStatus.Pending
      await mailchimp.updateMember(email, body)
      if (!isLocked) {
        await cacheLock.set(true)
      }
    }
  }
}
