import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import { CampaignLogo } from '@app/app/(campaign)/components/campaign-logo'
import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { ReferralCodeValidationResult } from '@app/graphql/republik-api/gql/graphql'
import { EventTrackingContext } from '@app/lib/matomo/event-tracking'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
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
  let pageContent = children
  if (
    !sender &&
    validateReferralCode === ReferralCodeValidationResult.NotFound
  ) {
    pageContent = (
      <>
        <p>Dieser Link ist leider ungültig.</p>
        <p>
          Vielleicht kennen Sie eine andere Republik-Verlegerin, die Sie
          einladen kann?
        </p>
        <p>
          Mit einem Probeabo können Sie die Republik ab sofort und{' '}
          <Link
            className={css({
              color: 'text',
            })}
            href='/probelesen'
          >
            kostenlos für 3 Wochen kennenlernen
          </Link>
          .
        </p>
      </>
    )
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

  return (
    <div data-page-theme='campaign-2024' data-theme-inverted>
      <PageLayout showHeader={false} showFooter={false}>
        <EventTrackingContext category='CampaignReceiverPage'>
          <Container>
            <div
              className={css({
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                background: 'pageBackground',
                color: 'text',
                // justifyContent: 'center',
              })}
            >
              <CampaignLogo
                inverted
                className={css({
                  width: { base: '120px', md: '240px' },
                  maxWidth: 'full',
                  height: 'auto',
                  mx: 'auto',
                  my: '8-16',
                })}
              />
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8',
                  // py: '8-16',
                  fontSize: 'xl',
                  position: 'relative',
                  minHeight: { md: '40rem', base: '100dvh' },
                  // maxHeight: 800,
                  justifyContent: 'stretch',
                })}
              >
                {pageContent}
              </div>
            </div>
          </Container>
        </EventTrackingContext>
      </PageLayout>
    </div>
  )
}
