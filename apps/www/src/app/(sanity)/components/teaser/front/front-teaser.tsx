import { ImageTeaser } from '@/app/(sanity)/components/teaser/front/image-teaser'
import { SplitTeaser } from '@/app/(sanity)/components/teaser/front/split-teaser'
import { TextTeaser } from '@/app/(sanity)/components/teaser/front/text-teaser'
import { VignetteTeaser } from '@/app/(sanity)/components/teaser/front/vignette-teaser'
import type { TeaserBlockFragmentType } from '@/app/(sanity)/groq/teaser-block-fragment'

type TeaserProps = TeaserBlockFragmentType['reference']

export function FrontTeaser(props: TeaserProps) {
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
