import { PageLayout } from '@app/components/layout'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { Metadata } from 'next'
import { ReactNode } from 'react'

// TODO: new copy
export const metadata: Metadata = {
  title: `Uns ist es nicht egal, was Sie von der Welt erfahren.`,
  description: 'Bis zum 28. September 2025 ab CHF 1.– für einen Monat.',
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
