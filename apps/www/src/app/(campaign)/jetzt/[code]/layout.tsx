import { getInviteeData } from '@app/app/(campaign)/campaign-data'
import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { Logo } from '@app/components/layout/header/logo'
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

  const { sender, me } = data

  // There is neither a sender nor is the referral code valid
  const referralCodeIsValid = false // TODO: validate via query
  let pageContent = children
  if (!sender && !referralCodeIsValid) {
    console.log('upsi')
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
  if (sender && me && sender.id === me.id) {
    return redirect('/jetzt-einladen')
  }

  return (
    <div data-page-theme='campaign-2024' data-theme-inverted>
      <PageLayout showHeader={false} showFooter={false}>
        <Container>
          <div
            className={css({
              minHeight: '100dvh',
              display: 'flex',
              flexDirection: 'column',
              background: 'pageBackground',
              color: 'text',
            })}
          >
            <div className={css({ py: '4' })}>
              <Logo />
            </div>
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '8',
                // py: '8-16',
                fontSize: 'xl',
                position: 'relative',
                minHeight: { md: '50rem', base: '100dvh' },
                // maxHeight: 800,
                justifyContent: 'stretch',
                margin: 'auto',
                // margin: 'auto',
              })}
            >
              {pageContent}
            </div>
          </div>
        </Container>
      </PageLayout>
    </div>
  )
}
