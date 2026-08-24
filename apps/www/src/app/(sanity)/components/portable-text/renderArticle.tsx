import { BlockQuote } from '@/app/(sanity)/components/portable-text/block-quote'
import { Heading } from '@/app/(sanity)/components/portable-text/blocks'
import { Button } from '@/app/(sanity)/components/portable-text/button'
import { Conditional } from '@/app/(sanity)/components/portable-text/conditional'
import { DividerStars } from '@/app/(sanity)/components/portable-text/divider-stars'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { EmbedDataWrapper } from '@/app/(sanity)/components/portable-text/embed-datawrapper'
import { Html } from '@/app/(sanity)/components/portable-text/html'
import { ImageGroup } from '@/app/(sanity)/components/portable-text/image-group'
import { InfoBox } from '@/app/(sanity)/components/portable-text/infobox'
import { InterviewQuestion } from '@/app/(sanity)/components/portable-text/interview-question'
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
import { SeriesNav } from '@/app/(sanity)/components/portable-text/series-nav'
import { StoryComponent } from '@/app/(sanity)/components/portable-text/story-component'
import { Toc } from '@/app/(sanity)/components/portable-text/toc'
import { UnknownType } from '@/app/(sanity)/components/portable-text/unknownComponent'
import { Variable } from '@/app/(sanity)/components/portable-text/variable'
import { WebOnly } from '@/app/(sanity)/components/portable-text/web-only'
import type { ArticlePortableTextContentFragmentType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { PortableText, type PortableTextReactComponents } from 'next-sanity'

const articleComponents: Partial<PortableTextReactComponents> = {
  unknownType: UnknownType,

  types: {
    blockQuote: BlockQuote,
    pullQuote: PullQuote,
    editorialImage: EditorialImage,
    imageGroup: ImageGroup,
    infoBox: InfoBox,
    divider: () => <hr />,
    dividerStars: DividerStars,
    webOnly: WebOnly,
    html: Html,
    embedVideo: LegacyEmbedVideo,
    seriesNav: SeriesNav,
    // This is the web, we never render emailOnly/voiceTag blocks :)
    emailOnly: () => null,
    voiceTag: () => null,
    // Wrap function because renderNode can't be passed to a client component
    button: ({ value }) => <Button value={value} />,
    if: ({ value }) => <Conditional value={value} />,
    ifNot: ({ value }) => <Conditional value={value} />,
    embedDataWrapper: ({ value }) => <EmbedDataWrapper value={value} />,
    variable: ({ value }) => <Variable value={value} />,
    storyComponent: ({ value }) => <StoryComponent value={value} />,
    dynamicComponent: ({ value }) => <LegacyDynamicComponent value={value} />,
    chart: ({ value }) => <LegacyChart value={value} />,
    toc: ({ value }) => <Toc value={value} />,
  },
  block: {
    heading: Heading,
    note: Note,
    interviewQuestion: InterviewQuestion,
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

export async function ArticlePortableText({
  value,
}: {
  value: ArticlePortableTextContentFragmentType['content']
}) {
  return <PortableText value={value} components={articleComponents} />
}
