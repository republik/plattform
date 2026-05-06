import Access from '@/components/Users/Access'

export default async function AccessGrantsPage({ params }) {
  const { userId } = await params
  return <Access userId={userId} />
}
