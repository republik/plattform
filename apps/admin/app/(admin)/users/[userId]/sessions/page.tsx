import Sessions from '@/components/Users/Sessions'

export default async function SessionsPage({ params }) {
  const { userId } = await params
  // @ts-expect-error not typed
  return <Sessions userId={userId} />
}
