import { BlockQuote } from '@/app/(sanity)/components/portable-text/block-quote'
import { Button } from '@/app/(sanity)/components/portable-text/button'
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
import { UnknownType } from '@/app/(sanity)/components/portable-text/unknownComponent'
import { type PageEditor } from '@/sanity.types'
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
    html: Html,
    embedVideo: LegacyEmbedVideo,
    // Wrap function because renderNode can't be passed to a client component
    button: ({ value }) => <Button value={value} />,
    embedDataWrapper: ({ value }) => <EmbedDataWrapper value={value} />,
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

export async function PagePortableText({ value }: { value: PageEditor }) {
  return <PortableText value={value} components={pageComponents} />
}
