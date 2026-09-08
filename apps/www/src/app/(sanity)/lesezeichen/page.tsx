import { BookmarksFeed } from '@/app/(sanity)/lesezeichen/components/bookmarks-feed'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css, cx } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'
import Link from 'next/link'

const linkStyle = css({
  fontSize: 'xl',
})

export default async function BookmarksPage({
  searchParams,
}: PageProps<'/lesezeichen'>) {
  const collection = ((await searchParams).view as string) ?? 'progress'

  return (
    <EventTrackingContext category='Bookmarks'>
      <div className={css({ my: '8' })}>
        <div className={editorialContent({ theme: 'META' })}>
          <h1 className='page-title'>Lesezeichen</h1>
          <div className={css({ display: 'flex', gap: '4' })}>
            <Link
              className={linkStyle}
              style={{
                textDecoration:
                  collection === 'progress' ? 'underline' : undefined,
              }}
              href={`/lesezeichen`}
            >
              Weiterlesen
            </Link>
            <Link
              className={linkStyle}
              style={{
                textDecoration:
                  collection === 'bookmarks' ? 'underline' : undefined,
              }}
              href={`/lesezeichen?view=bookmarks`}
            >
              Gemerkt
            </Link>
          </div>

          <BookmarksFeed collection={collection} />
        </div>
      </div>
    </EventTrackingContext>
  )
}
