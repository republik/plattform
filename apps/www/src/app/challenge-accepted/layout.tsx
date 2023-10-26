import Footer from '@app/components/layout/footer'
import { PageHeader } from '@app/components/layout/header'
import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import { notFound } from 'next/navigation'

export default async function Layout(props: {
  children: React.ReactNode
  overlay: React.ReactNode
}) {
  const me = await getMe()

  // TODO: temporary until the relase of «challenge accepted»
  if (
    !me?.roles.some((role) => ['editor', 'moderator', 'admin'].includes(role))
  ) {
    return notFound()
  }

  return (
    <div data-page-theme='challenge-accepted'>
      <PageHeader />
      <div
        className={css({
          color: 'text',
          bg: 'pageBackground',
          pb: '32',
          pt: '4',
        })}
        style={{
          minHeight: 'calc(100dvh - 69px)',
        }}
      >
        {props.children}
        {props.overlay}
      </div>
      <Footer />
    </div>
  )
}
