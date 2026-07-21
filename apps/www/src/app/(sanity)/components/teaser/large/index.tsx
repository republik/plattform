import { ImageTeaser } from '@/app/(sanity)/components/teaser/large/image-teaser'
import { SplitTeaser } from '@/app/(sanity)/components/teaser/large/split-teaser'
import { TextTeaser } from '@/app/(sanity)/components/teaser/large/text-teaser'
import { VignetteTeaser } from '@/app/(sanity)/components/teaser/large/vignette-teaser'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { dataAttribute } from '@/app/(sanity)/lib/data-attribute'

export function TeaserLarge(props: TeaserLargeFragmentType) {
  const sanityDataAttribute = dataAttribute({
    type: props._type,
    id: props._id,
    path: 'teaserLarge',
  })
  switch (props.teaser?.layout) {
    case 'IMAGE':
      return (
        <div
          data-teaser-layout={props.teaser.layout}
          data-sanity={sanityDataAttribute}
        >
          <ImageTeaser {...props} />
        </div>
      )
    case 'TEXT':
      return (
        <div
          data-teaser-layout={props.teaser.layout}
          data-sanity={sanityDataAttribute}
        >
          <TextTeaser {...props} />
        </div>
      )
    case 'VIGNETTE':
      return (
        <div
          data-teaser-layout={props.teaser.layout}
          data-sanity={sanityDataAttribute}
        >
          <VignetteTeaser {...props} />
        </div>
      )
    case 'SPLIT':
      return (
        <div
          data-teaser-layout={props.teaser.layout}
          data-sanity={sanityDataAttribute}
        >
          <SplitTeaser {...props} />
        </div>
      )
    default:
      return null
  }
}
