import { getCampaignReferralsData } from '@app/app/(campaign)/campaign-data'
import { CampaignLogo } from '@app/app/(campaign)/components/campaign-logo'
import { UNELIGIBLE_RECEIVER_MEMBERSHIPS } from '@app/app/(campaign)/constants'
import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { getMe } from '@app/lib/auth/me'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: `Unterstützen Sie die Republik mit einem Abo!`,
  description: 'Bis zum 31. März 2024 ab CHF 120 für ein Jahr.',
  robots: { index: false, follow: false },
}

export default async function CampaignLayout({
  children,
}: {
  children: ReactNode
}) {
  const [{ me }, { campaign }] = await Promise.all([
    getMe(),
    getCampaignReferralsData(),
  ])

  // Redirect to campaign over page
  if (!campaign?.isActive) {
    return redirect('/jetzt-vorbei')
  }

  // User is logged in but has some kind of yearly subscription
  const meIsEligible = !UNELIGIBLE_RECEIVER_MEMBERSHIPS.includes(
    me?.activeMembership?.type.name,
  )
  if (me && !meIsEligible) {
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
                variant='red-inverted'
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
                {children}
              </div>
            </div>
          </Container>
        </EventTrackingContext>
      </PageLayout>
    </div>
  )
}
