import { BlockQuote } from '@/app/(sanity)/components/portable-text/block-quote'
import { Button } from '@/app/(sanity)/components/portable-text/button'
import { Conditional } from '@/app/(sanity)/components/portable-text/conditional'
import { DynamicComponent } from '@/app/(sanity)/components/portable-text/dynamic-compontent'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { EmbedDataWrapper } from '@/app/(sanity)/components/portable-text/embed-datawrapper'
import { Html } from '@/app/(sanity)/components/portable-text/html'
import { ImageGroup } from '@/app/(sanity)/components/portable-text/image-group'
import { InfoBox } from '@/app/(sanity)/components/portable-text/infobox'
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
import { UnknownType } from '@/app/(sanity)/components/portable-text/unknownComponent'
import { Variable } from '@/app/(sanity)/components/portable-text/variable'
import { WebOnly } from '@/app/(sanity)/components/portable-text/web-only'
import { type ArticleEditor } from '@/sanity.types'
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
    // This is the web, we never render emailOnly blocks :)
    emailOnly: () => null,
    webOnly: WebOnly,
    html: Html,
    embedVideo: LegacyEmbedVideo,
    seriesNav: SeriesNav,
    // Wrap function because renderNode can't be passed to a client component
    button: ({ value }) => <Button value={value} />,
    if: ({ value }) => <Conditional value={value} />,
    ifNot: ({ value }) => <Conditional value={value} />,
    embedDataWrapper: ({ value }) => <EmbedDataWrapper value={value} />,
    variable: ({ value }) => <Variable value={value} />,
    dynamicComponent: ({ value }) => <DynamicComponent value={value} />,
  },
  block: {
    heading: ({ children }) => <h2>{children}</h2>,
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

export async function ArticlePortableText({ value }: { value: ArticleEditor }) {
  return <PortableText value={value} components={articleComponents} />
}
