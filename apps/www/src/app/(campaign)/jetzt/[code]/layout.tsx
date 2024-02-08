import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { Logo } from '@app/components/layout/header/logo'
import { CampaignInviteeDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import { redirect } from 'next/navigation'

const UNELIGIBLE_RECEIVER_MEMBERSHIPS = ['ABO', 'YEARLY_ABO', 'BENEFACTOR_ABO']

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { code: string }
}) {
  const { data } = await getClient().query({
    query: CampaignInviteeDocument,
    variables: { referralCode: params.code },
    errorPolicy: 'all',
  })

  const { sender } = data

  const isEligible = !UNELIGIBLE_RECEIVER_MEMBERSHIPS.includes(
    data.me?.activeMembership.type.name,
  )

  if (!isEligible) {
    return redirect('/jetzt-einladen')
  }

  if (sender && data.me && sender?.id === data.me?.id) {
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
              {children}
            </div>
          </div>
        </Container>
      </PageLayout>
    </div>
  )
}
