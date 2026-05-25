import Link from 'next/link'

// TODO: add publish date

function ContributorLink({ contributor }) {
  if (!contributor.slug) return contributor.name
  return <Link href={`/~${contributor.slug}`}>{contributor.name}</Link>
}

export async function Byline({ contributors }) {
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
