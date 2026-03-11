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

  if (!name || !email || !mac) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: '64px auto',
          padding: '0 15px',
          textAlign: 'center',
        }}
      >
        <p>Ungültiger Bestätigungslink.</p>
      </div>
    )
  }

  return (
    <NewsletterConfirm
      name={name}
      email={email}
      subscribed={subscribed ?? '1'}
      mac={mac}
    />
  )
}
