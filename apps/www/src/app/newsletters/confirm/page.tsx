import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { css } from '@republik/theme/css'
import { type Metadata } from 'next'
import { NewsletterConfirm } from './newsletter-confirm'

export const metadata: Metadata = {
  title: 'Newsletter-Anmeldung bestätigen',
}

type PageProps = {
  searchParams: Promise<{
    name?: string
    email?: string
    subscribed?: string
    mac?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const { name, email, subscribed, mac } = await searchParams

  return (
    <PageLayout>
      <div className={css({ color: 'text', pb: '16-32', pt: '4' })}>
        <Container>
          {!name || !email || !mac ? (
            <p className={css({ textAlign: 'center', color: 'textSoft' })}>
              Ungültiger Bestätigungslink.
            </p>
          ) : (
            <NewsletterConfirm
              name={name}
              email={email}
              subscribed={subscribed ?? '1'}
              mac={mac}
            />
          )}
        </Container>
      </div>
    </PageLayout>
  )
}
