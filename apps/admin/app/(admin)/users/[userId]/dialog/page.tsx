import Dialog from '@/components/Users/Dialog'

export default async function DialogPage({ params }) {
  const { userId } = await params
  return <Dialog userId={userId} />
}
