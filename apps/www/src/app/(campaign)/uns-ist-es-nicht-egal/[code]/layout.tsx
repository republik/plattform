import { ReferralCodeValidationResult } from '#graphql/republik-api/__generated__/gql/graphql'
import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import { redirect } from 'next/navigation'

export default async function Layout(props: {
  children: React.ReactNode
  params: Promise<{ code: string }>
}) {
  const params = await props.params

  const { children } = props

  const data = await getInviteeData(params)

  const { sender, me, validateReferralCode } = data

  // There is neither a sender nor is the referral code valid
  if (
    !sender &&
    validateReferralCode === ReferralCodeValidationResult.NotFound
  ) {
    return redirect('/uns-ist-es-nicht-egal')
  }

  // User is logged in but does not have some kind of subscription
  const meIsEligible = !me?.activeMembership && !me?.activeMagazineSubscription

  if (me && !meIsEligible) {
    return redirect('/einladen')
  }

  // Sender and user are the same person
  if (
    validateReferralCode === ReferralCodeValidationResult.IsOwn ||
    params.code === me?.slug
  ) {
    return redirect('/einladen')
  }

  return <>{children}</>
}
