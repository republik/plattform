import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { css } from '@app/styled-system/css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Veranstaltungen',
    template: '%s – Veranstaltungen – Republik',
  },
}

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
          <Container>{props.children}</Container>
        </div>
      </PageLayout>
    </div>
  )
}
