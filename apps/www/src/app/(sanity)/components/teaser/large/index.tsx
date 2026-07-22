import { ImageTeaser } from '@/app/(sanity)/components/teaser/large/image-teaser'
import { SplitTeaser } from '@/app/(sanity)/components/teaser/large/split-teaser'
import { TextTeaser } from '@/app/(sanity)/components/teaser/large/text-teaser'
import { VignetteTeaser } from '@/app/(sanity)/components/teaser/large/vignette-teaser'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { dataAttribute } from '@/app/(sanity)/lib/data-attribute'

export function TeaserLarge(props: TeaserLargeFragmentType) {
  switch (props.teaser?.layout) {
    case 'IMAGE':
      return <ImageTeaser {...props} />
    case 'TEXT':
      return <TextTeaser {...props} />
    case 'VIGNETTE':
      return <VignetteTeaser {...props} />
    case 'SPLIT':
      return <SplitTeaser {...props} />
    default:
      return null
  }
}
