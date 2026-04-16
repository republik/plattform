import Mailbox from '@/components/Users/Mailbox'

export default async function MailboxPage({ params }) {
  const { userId } = await params
  return <Mailbox userId={userId} />
}
