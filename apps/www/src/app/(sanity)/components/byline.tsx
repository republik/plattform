import { sanityFetch } from '@/app/(sanity)/lib/live'
import { defineQuery } from 'next-sanity'
import Link from 'next/link'

// TODO: add publish date
const BYLINE_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $articleSlug][0]{
    _id,
    contributors[]{
      _id,
      kind,
      "slug": contributor->userId,
      "name": contributor->title,
    }
  }`,
)

function ContributorLink({ contributor }) {
  if (!contributor.slug) return contributor.name
  return <Link href={`/~${contributor.slug}`}>{contributor.name}</Link>
}

export async function Byline({ articleSlug }: { articleSlug: string }) {
  const {
    data: { contributors },
  } = await sanityFetch({
    query: BYLINE_QUERY,
    params: { articleSlug },
  })

  if (!contributors) return null

  // voice: listed directly in the audio player
  const bylineContributors = contributors.filter((c) => c.kind !== 'voice')

  if (!bylineContributors) return null

  return (
    <span>
      Von{' '}
      {bylineContributors.map((contributor, i) => [
        i > 0 && ', ',
        <ContributorLink contributor={contributor} key={i} />,
        ` (${contributor.kind})`,
      ])}
    </span>
  )
}
