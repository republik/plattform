import { PageLayout } from '@app/components/layout'
import { css } from '@republik/theme/css'

export const revalidate = 60 // revalidate all pages every minute

export default async function Layout(props: { children: React.ReactNode }) {
  return (
    <div data-page-theme='challenge-accepted'>
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
