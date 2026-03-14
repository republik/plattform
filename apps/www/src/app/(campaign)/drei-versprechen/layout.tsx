import { PageLayout } from '@app/components/layout'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { Metadata } from 'next'
import { ReactNode } from 'react'

// TODO: new copy
export const metadata: Metadata = {
  title: '2000 neuen Mitgliedern, 3 Versprechen',
  description: 'Republik Jahresabo: 50% günstiger bis zum 14. April 2026.',
  robots: { index: false, follow: false },
}

export default async function CampaignLayout({
  children,
}: {
  children: ReactNode
}) {
  /*const [{ me }, { campaign }] = await Promise.all([
    getMe(),
    getCampaignReferralsData(),
  ])*/

  return (
    <div data-page-theme='campaign-2026'>
      <PageLayout showHeader={false} showFooter={false}>
        <EventTrackingContext category='CampaignLandingPage'>
          {children}
        </EventTrackingContext>
      </PageLayout>
    </div>
  )
}
