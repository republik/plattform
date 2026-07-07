import { FrontTeaser } from '@/app/(sanity)/components/portable-text/front-teaser'
import { TeaserBlockFragmentType } from '@/app/(sanity)/groq/teaser-block-fragment'

export async function TeaserItem({
  teaser,
}: {
  teaser: TeaserBlockFragmentType
}) {
  return (
    <FrontTeaser
      href={`/articles${teaser.reference.slug}`}
      value={teaser.reference.frontTeaser}
    />
  )
}
