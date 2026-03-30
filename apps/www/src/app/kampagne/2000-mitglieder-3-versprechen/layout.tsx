import { PageLayout } from '@app/components/layout'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '2000 neue Mitglieder, 3 Versprechen',
  description: 'Republik abonnieren: 50 % Rabatt bis zum 14. April 2026.',
  robots: { index: false, follow: false },
}

export default async function CampaignLayout({
  children,
}: {
  children: ReactNode
}) {
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
