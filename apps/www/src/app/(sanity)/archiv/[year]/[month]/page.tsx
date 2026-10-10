import { ArchiveMosaic } from '@/app/(sanity)/archiv/components/archive-mosaic'
import { ArchiveTile } from '@/app/(sanity)/archiv/components/archive-tile'
import {
  getMonthName,
  isRecentMonth,
  parseArchiveParams,
  zurichMonthRange,
} from '@/app/(sanity)/archiv/lib/month-range'
import { ARCHIVE_MONTH_TEASERS_QUERY } from '@/app/(sanity)/groq/archive-month-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
import { CDN_FRONTEND_BASE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type ArchiveParams = Promise<{ year: string; month: string }>

export async function generateMetadata({
  params,
}: {
  params: ArchiveParams
}): Promise<Metadata> {
  const parsed = parseArchiveParams(await params)
  if (!parsed) return { title: 'Archiv' }

  const title = `${getMonthName(parsed.month)} ${parsed.year}`
  const description = `Die Republik-Beiträge aus ${title} im Überblick.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: new URL(
        `/archiv/${parsed.year}/${parsed.month}`,
        process.env.NEXT_PUBLIC_BASE_URL,
      ),
      images: `${CDN_FRONTEND_BASE_URL}/static/social-media/overview.png`,
    },
  }
}

export default async function ArchiveMonthPage({
  params,
}: {
  params: ArchiveParams
}) {
  const parsed = parseArchiveParams(await params)
  if (!parsed) notFound()

  const { year, month } = parsed
  const teasers = await sanityClientFetch(
    ARCHIVE_MONTH_TEASERS_QUERY,
    zurichMonthRange(year, month),
    {
      tag: 'archive-month',
      next: {
        revalidate: isRecentMonth(year, month) ? 60 : 60 * 60 * 24,
        tags: ['archive'],
      },
    },
  )

  return (
    <ArchiveMosaic>
      {teasers.map((teaser) => (
        <ArchiveTile key={teaser._id} teaser={teaser} />
      ))}
    </ArchiveMosaic>
  )
}
