import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { css } from '@republik/theme/css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Anmelden',
    template: '%s – Anmelden – Republik',
  },
}

export const revalidate = 60 // revalidate all event pages every minute

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
