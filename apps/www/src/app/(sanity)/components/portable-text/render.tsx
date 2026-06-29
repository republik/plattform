import {
  Em,
  ExternalLink,
  InternalLink,
  Strong,
  Sub,
  Sup,
} from '@/app/(sanity)/components/portable-text/marks'
import { UnknownType } from '@/app/(sanity)/components/portable-text/unknownComponent'
import { type InlineEditor, type NestedEditor } from '@/sanity.types'
import { PortableText, type PortableTextReactComponents } from 'next-sanity'

const inlineComponents: Partial<PortableTextReactComponents> = {
  unknownType: UnknownType,

  block: {
    // Inline PT can only contain 1 paragraph, so we unwrap it
    normal: ({ children }) => <>{children}</>,
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

export function InlinePortableText({ value }: { value: InlineEditor }) {
  return <PortableText components={inlineComponents} value={value} />
}

const nestedComponents: Partial<PortableTextReactComponents> = {
  unknownType: UnknownType,

  block: {
    heading: ({ children }) => <h2>{children}</h2>,
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

export function NestedPortableText({ value }: { value: NestedEditor }) {
  return <PortableText components={nestedComponents} value={value} />
}
