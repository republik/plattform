import { PageLayout } from '@app/components/layout'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'

export default async function Layout(props: { children: React.ReactNode }) {
  return (
    <div data-page-theme='campaign-2025'>
      <PageLayout>
        <EventTrackingContext category='CampaignSenderPage'>
          <div
            className={css({
              color: 'text',
              bg: 'pageBackground',
            })}
            style={{
              minHeight: 'calc(100dvh - 69px)',
            }}
          >
            {props.children}
          </div>
        </EventTrackingContext>
      </PageLayout>
    </div>
  )
}
