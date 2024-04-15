import { PageLayout } from '@app/components/layout'
import { EventTrackingContext } from '@app/lib/matomo/event-tracking'
import { css } from '@republik/theme/css'

export default async function Layout(props: { children: React.ReactNode }) {
  return (
    <div data-page-theme='campaign-2024'>
      <PageLayout>
        <EventTrackingContext category='CampaignSenderPage'>
          <div
            className={css({
              color: 'text',
              bg: 'pageBackground',
              pb: '16-32',
              pt: '4',
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
