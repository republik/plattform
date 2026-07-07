import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import type { TeaserBlockFragmentType } from '@/app/(sanity)/groq/teaser-block-fragment'

type TeaserProps = TeaserBlockFragmentType['reference']

export function VignetteTeaser({ teaser }: TeaserProps) {
  return (
    <div>
      <h2>
        <InlinePortableText value={teaser.title} />
      </h2>
      <p>
        <InlinePortableText value={teaser.lead} />
      </p>
    </div>
  )
}
