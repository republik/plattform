import { BlockQuote } from '@/app/(sanity)/components/portable-text/block-quote'
import { Heading } from '@/app/(sanity)/components/portable-text/blocks'
import { Button } from '@/app/(sanity)/components/portable-text/button'
import { DividerStars } from '@/app/(sanity)/components/portable-text/divider-stars'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { EmbedDataWrapper } from '@/app/(sanity)/components/portable-text/embed-datawrapper'
import { Html } from '@/app/(sanity)/components/portable-text/html'
import { ImageGroup } from '@/app/(sanity)/components/portable-text/image-group'
import { InfoBox } from '@/app/(sanity)/components/portable-text/infobox'
import { LegacyChart } from '@/app/(sanity)/components/portable-text/legacy-chart'
import { LegacyDynamicComponent } from '@/app/(sanity)/components/portable-text/legacy-dynamic-component'
import { LegacyEmbedVideo } from '@/app/(sanity)/components/portable-text/legacy-embed-video'
import {
  Em,
  ExternalLink,
  InternalLink,
  Strong,
  Sub,
  Sup,
} from '@/app/(sanity)/components/portable-text/marks'
import { Note } from '@/app/(sanity)/components/portable-text/note'
import { PullQuote } from '@/app/(sanity)/components/portable-text/pull-quote'
import { StoryComponent } from '@/app/(sanity)/components/portable-text/story-component'
import { Toc } from '@/app/(sanity)/components/portable-text/toc'
import { UnknownType } from '@/app/(sanity)/components/portable-text/unknownComponent'
import type { PagePortableTextContentFragmentType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { PortableText, type PortableTextReactComponents } from 'next-sanity'

const pageComponents: Partial<PortableTextReactComponents> = {
  unknownType: UnknownType,

  types: {
    blockQuote: BlockQuote,
    pullQuote: PullQuote,
    editorialImage: EditorialImage,
    imageGroup: ImageGroup,
    infoBox: InfoBox,
    divider: () => <hr />,
    dividerStars: DividerStars,
    html: Html,
    embedVideo: LegacyEmbedVideo,
    // Wrap function because renderNode can't be passed to a client component
    button: ({ value }) => <Button value={value} />,
    embedDataWrapper: ({ value }) => <EmbedDataWrapper value={value} />,
    storyComponent: ({ value }) => <StoryComponent value={value} />,
    dynamicComponent: ({ value }) => <LegacyDynamicComponent value={value} />,
    chart: ({ value }) => <LegacyChart value={value} />,
    toc: ({ value }) => <Toc value={value} />,
  },
  block: {
    heading: Heading,
    note: Note,
  },
  marks: {
    strong: Strong,
    em: Em,
    sub: Sub,
    sup: Sup,
    link: ExternalLink,
    internalLink: InternalLink,
  },
}

export async function PagePortableText({
  value,
}: {
  value: PagePortableTextContentFragmentType['content']
}) {
  return <PortableText value={value} components={pageComponents} />
}
