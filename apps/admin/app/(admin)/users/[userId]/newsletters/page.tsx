import NewsletterSubscriptions from '@/components/Users/NewsletterSubscriptions'

export default async function SubscriptionsPage({ params }) {
  const { userId } = await params
  return (
    <div>
      <NewsletterSubscriptions userId={userId} />
    </div>
  )
}
