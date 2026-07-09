import { ImageTeaser } from '@/app/(sanity)/components/teaser/front/image-teaser'
import { SplitTeaser } from '@/app/(sanity)/components/teaser/front/split-teaser'
import { TextTeaser } from '@/app/(sanity)/components/teaser/front/text-teaser'
import { VignetteTeaser } from '@/app/(sanity)/components/teaser/front/vignette-teaser'
import type { FrontTeaserFragmentType } from '@/app/(sanity)/groq/front-teaser-fragment'

type TeaserProps = FrontTeaserFragmentType

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
