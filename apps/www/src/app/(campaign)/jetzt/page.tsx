import { CampaignLogo } from '@app/app/(campaign)/components/campaign-logo'
import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { getMe } from '@app/lib/auth/me'
import { EventTrackingContext } from '@app/lib/matomo/event-tracking'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Page() {
  const me = await getMe()

  if (me) {
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
                <p>Dieser Link ist leider ungültig.</p>
                <p>
                  Vielleicht kennen Sie eine Republik-Verlegerin, die Sie
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
              </div>
            </div>
          </Container>
        </EventTrackingContext>
      </PageLayout>
    </div>
  )
}
