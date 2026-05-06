import Memberships from '@/components/Users/Memberships'

import Pledges from '@/components/Users/Pledges'

export default async function SubscriptionsPage({ params }) {
  const { userId } = await params
  return (
    <div>
      <Memberships userId={userId} />
      <Pledges userId={userId} />
    </div>
  )
}
