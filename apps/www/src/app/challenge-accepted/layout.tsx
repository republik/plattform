import Footer from '@app/components/layout/footer'
import { PageHeader } from '@app/components/layout/header'
import { css } from '@app/styled-system/css'

export default function Layout(props: {
  children: React.ReactNode
  overlay: React.ReactNode
}) {
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
