import { ArchiveMosaic } from '@/app/(sanity)/archiv/components/archive-mosaic'
import { ArchiveTile } from '@/app/(sanity)/archiv/components/archive-tile'
import { ArchiveTimelineNavigation } from '@/app/(sanity)/archiv/components/archive-timeline-navigation'
import { dedupeAndSortTeasers } from '@/app/(sanity)/archiv/lib/archive-teasers'
import {
  MIN_YEAR,
  getMonthName,
  zurichMonthRange,
} from '@/app/(sanity)/archiv/lib/month-range'
import {
  ARCHIVE_MONTH_TEASERS_QUERY,
  ARCHIVE_MONTH_TEASER_COUNT_QUERY,
} from '@/app/(sanity)/groq/archive-month-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { CDN_FRONTEND_BASE_URL } from '@/lib/constants'
import { css } from '@republik/theme/css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

type ArchiveParams = { year: string; month: string }

/** Returns null when the route is out of range, so callers can 404. */
function parseParams({ year, month }: ArchiveParams) {
  const parsedYear = parseInt(year, 10)
  const parsedMonth = parseInt(month, 10)

  if (
    isNaN(parsedYear) ||
    parsedYear < MIN_YEAR ||
    parsedYear > new Date().getFullYear()
  ) {
    return null
  }
  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) return null

  return { year: parsedYear, month: parsedMonth }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ArchiveParams>
}): Promise<Metadata> {
  const parsed = parseParams(await params)
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

/** Which months of a year have front teasers. */
async function fetchMonthsWithContent(year: number): Promise<number[]> {
  const counts = await Promise.all(
    MONTHS.map((month) =>
      sanityClientFetch(
        ARCHIVE_MONTH_TEASER_COUNT_QUERY,
        zurichMonthRange(year, month),
        { tag: 'archive-month-count' },
      ),
    ),
  )

  return MONTHS.filter((_, i) => counts[i] > 0)
}

export default async function ArchiveMonthPage({
  params,
}: {
  params: Promise<ArchiveParams>
}) {
  const parsed = parseParams(await params)
  if (!parsed) notFound()
  const { year, month } = parsed

  const monthsWithContent = await fetchMonthsWithContent(year)

  // Empty months render as themselves rather than redirecting elsewhere, so
  // every month in the navigation stays reachable.
  const teasers = monthsWithContent.includes(month)
    ? dedupeAndSortTeasers(
        await sanityClientFetch(
          ARCHIVE_MONTH_TEASERS_QUERY,
          zurichMonthRange(year, month),
          { tag: 'archive-month' },
        ),
      )
    : []

  return (
    <EventTrackingContext category='Archiv'>
      <div className={css({ px: '4' })}>
        <ArchiveTimelineNavigation
          year={year}
          month={month}
          monthsWithContent={monthsWithContent}
        />
        {teasers.length ? (
          <ArchiveMosaic>
            {teasers.map((teaser) => (
              <ArchiveTile key={teaser._id} teaser={teaser} />
            ))}
          </ArchiveMosaic>
        ) : (
          <p
            className={css({
              textStyle: 'sans',
              color: 'textSoft',
              textAlign: 'center',
              py: '16',
            })}
          >
            Es liegen keine Beiträge vor.
          </p>
        )}
      </div>
    </EventTrackingContext>
  )
}
