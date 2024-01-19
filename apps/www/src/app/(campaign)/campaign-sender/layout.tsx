import { PageLayout } from '@app/components/layout'
import { css } from '@app/styled-system/css'

export default async function Layout(props: { children: React.ReactNode }) {
  return (
    <div data-page-theme='campaign-2024'>
      <PageLayout>
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
      </PageLayout>
    </div>
  )
}
