import { parseArchiveParams } from '@/app/(sanity)/archiv/lib/month-range'
import { notFound } from 'next/navigation'

// Validates above the loading boundary: a notFound() in the streamed page
// would come too late to set the 404 status.
export default async function ArchiveMonthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ year: string; month: string }>
}) {
  if (!parseArchiveParams(await params)) notFound()
  return children
}
