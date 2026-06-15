import { type InlineEditor } from '@/sanity.types'
import { PortableText, type PortableTextReactComponents } from 'next-sanity'

const inlineComponents: Partial<PortableTextReactComponents> = {
  block: {
    // Inline PT can only contain 1 paragraph, so we unwrap it
    normal: ({ children }) => <>{children}</>,
  },
  marks: {
    sub: ({ children }) => <sub>{children}</sub>,
    sup: ({ children }) => <sup>{children}</sup>,
  },
}

export function InlinePortableText({ value }: { value: InlineEditor }) {
  return <PortableText components={inlineComponents} value={value} />
}
