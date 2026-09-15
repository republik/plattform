import {
  MyRepublikDocument,
  ProgressState,
} from '#graphql/republik-api/__generated__/gql/graphql'
import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { ARTICLES_BY_IDS_QUERY } from '@/app/(sanity)/groq/articles-by-ids-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { Spinner } from '@/app/components/ui/spinner'
import { getClient } from '@/app/lib/apollo/client'
import { getMe } from '@/app/lib/auth/me'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { Suspense } from 'react'

const gridStyle = css({
  display: 'grid',
  maxWidth:
    'calc(token(sizes.editorial) + token(spacing.40) + token(spacing.40))',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '8',
  p: '8',
  mx: 'auto',
})

export function MyRepublik() {
  return (
    <Suspense fallback={<Spinner size='full' />}>
      <MyRepublikWithData />
    </Suspense>
  )
}

async function MyRepublikWithData() {
  const { me } = await getMe()

  if (!me) return null

  const gql = await getClient()

  const { data, error } = await gql.query({
    query: MyRepublikDocument,
    variables: {
      names: me.progressOptOut ? ['bookmarks'] : ['progress', 'bookmarks'],
      progress: me.progressOptOut ? null : ProgressState.Unfinished,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  const progressIds = data.progress?.nodes?.map((n) => n.sanityId) ?? []
  const notificationIds =
    data.notifications?.nodes
      ?.filter((n) => n.object?.__typename === 'SanityDocumentRef')
      .map((n) => (n.object as { id: string })?.id) ?? []

  const { data: teasers } = await sanityFetch({
    query: ARTICLES_BY_IDS_QUERY,
    params: { ids: [...progressIds, ...notificationIds] },
  })
  const teasersById = new Map(teasers.map((t) => [t._id, t]))

  // keep API order
  const progressTeasers = progressIds
    .map((id) => teasersById.get(id))
    .filter((teaser) => teaser !== undefined)
  const notificationTeasers = notificationIds
    .map((id) => teasersById.get(id))
    .filter((teaser) => teaser !== undefined)

  if (!progressTeasers.length && !notificationTeasers.length) return null

  return (
    <div className={gridStyle}>
      {progressTeasers.length > 0 && (
        <div>
          <h2 className={css({ textStyle: 'metaSubheading', mb: '8' })}>
            <Link href='/lesezeichen'>Weiterlesen</Link>
          </h2>
          {progressTeasers.map((teaser) => (
            <FeedTeaser key={teaser._id} teaser={teaser} />
          ))}
        </div>
      )}
      {notificationTeasers.length > 0 && (
        <div>
          <h2 className={css({ textStyle: 'metaSubheading', mb: '8' })}>
            <Link href='/benachrichtigungen'>Abonnierte Beiträge</Link>
          </h2>
          {notificationTeasers.map((teaser) => (
            <FeedTeaser key={teaser._id} teaser={teaser} />
          ))}
        </div>
      )}
    </div>
  )
}
