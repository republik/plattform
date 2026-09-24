import type { TeaserLargeProps } from '@/app/(sanity)/components/teaser/large/helpers'
import { ImageTeaser } from '@/app/(sanity)/components/teaser/large/image-teaser'
import { SplitTeaser } from '@/app/(sanity)/components/teaser/large/split-teaser'
import { TextTeaser } from '@/app/(sanity)/components/teaser/large/text-teaser'
import { VignetteTeaser } from '@/app/(sanity)/components/teaser/large/vignette-teaser'

export function TeaserLarge(props: TeaserLargeProps) {
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
