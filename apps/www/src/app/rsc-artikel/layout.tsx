import { PageLayout } from '@app/components/layout'
import { css } from '@app/styled-system/css'

export default async function Layout(props: { children: React.ReactNode }) {
  return (
    <div>
      <PageLayout>
        <div
          className={css({
            color: 'text',
            pb: '16-32',
            pt: '4',
          })}
        >
          {props.children}
        </div>
      </PageLayout>
    </div>
  )
}
