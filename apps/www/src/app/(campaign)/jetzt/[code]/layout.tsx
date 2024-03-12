import { ReferralCodeValidationResult } from '#graphql/republik-api/__generated__/gql/graphql'
import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import { redirect } from 'next/navigation'

const UNELIGIBLE_RECEIVER_MEMBERSHIPS = ['ABO', 'YEARLY_ABO', 'BENEFACTOR_ABO']

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { code: string }
}) {
  const data = await getInviteeData(params)

  const { sender, me, validateReferralCode } = data

  // There is neither a sender nor is the referral code valid
  if (
    !sender &&
    validateReferralCode === ReferralCodeValidationResult.NotFound
  ) {
    return redirect('/jetzt')
  }

  // User is logged in but has some kind of yearly subscription
  const meIsEligible = !UNELIGIBLE_RECEIVER_MEMBERSHIPS.includes(
    me?.activeMembership?.type.name,
  )
  if (me && !meIsEligible) {
    return redirect('/jetzt-einladen')
  }

  // Sender and user are the same person
  if (
    validateReferralCode === ReferralCodeValidationResult.IsOwn ||
    params.code === me?.slug
  ) {
    return redirect('/jetzt-einladen')
  }

  // There is neither a sender nor is the referral code valid
  if (
    !sender &&
    validateReferralCode === ReferralCodeValidationResult.NotFound
  ) {
    return redirect('/jetzt')
  }

  return <>{children}</>
}
