import { getCampaignReferralsData } from '@app/app/(campaign)/campaign-data'
import { PageLayout } from '@app/components/layout'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { getMe } from '@app/lib/auth/me'
import { css } from '@republik/theme/css'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: `Uns ist nicht egal, was Sie von der Welt erfahren.`,
  description: 'Bis zum 28. September 2025 ab CHF 1 für einen Monat.',
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

  // User is logged in but does not have some kind of subscription
  const meIsEligible = !me?.activeMembership && !me?.activeMagazineSubscription

  if (me && !meIsEligible) {
    return redirect('/einladen')
  }

  return (
    <div data-page-theme='campaign-2025'>
      <PageLayout showHeader={false} showFooter={false}>
        <EventTrackingContext category='CampaignReceiverPage'>
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
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
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
        </EventTrackingContext>
      </PageLayout>
    </div>
  )
}
