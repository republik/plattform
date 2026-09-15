import { BookmarksFeed } from '@/app/(sanity)/lesezeichen/components/bookmarks-feed'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { getMe } from '@/app/lib/auth/me'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const linkStyle = css({
  fontSize: 'xl',
})

export default async function BookmarksPage({
  searchParams,
}: PageProps<'/lesezeichen'>) {
  const collection = ((await searchParams).view as string) ?? 'progress'

  const { me } = await getMe()

  // Bookmarks are per-user; there is nothing to show a signed-out reader.
  if (!me) {
    return redirect(`/anmelden?redirect=${encodeURIComponent('/lesezeichen')}`)
  }

  // "Weiterlesen" filters on reading progress, which an opted-out reader has
  // none of — the API returns nothing for that filter, so the tab would always
  // be empty. Leave them with "Gemerkt" as the only (and so unlabelled) view.
  const progressOptOut = me.progressOptOut === true

  if (progressOptOut && collection !== 'bookmarks') {
    return redirect('/lesezeichen?view=bookmarks')
  }

  return (
    <EventTrackingContext category='Bookmarks'>
      <div className={css({ my: '8' })}>
        <div className={editorialContent({ theme: 'META' })}>
          <h1 className='page-title'>Lesezeichen</h1>
          {!progressOptOut && (
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
          )}

          <BookmarksFeed collection={collection} />
        </div>
      </div>
    </EventTrackingContext>
  )
}
