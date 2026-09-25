import { ArchiveTimelineNavigation } from '@/app/(sanity)/archiv/components/archive-timeline-navigation'
import { PageLayout } from '@/app/components/layout'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'

export const revalidate = 60

export default async function ArchiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PageLayout>
      <EventTrackingContext category='Archiv'>
        <div className={css({ color: 'text', px: '4', pb: '16-32' })}>
          <ArchiveTimelineNavigation />
          {children}
        </div>
      </EventTrackingContext>
    </PageLayout>
  )
}
