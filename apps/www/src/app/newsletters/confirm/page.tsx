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
    mac?: string
    ref?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const { name, email, mac, ref } = await searchParams

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
              mac={mac}
              signupRef={ref}
            />
          )}
        </Container>
      </div>
    </PageLayout>
  )
}
