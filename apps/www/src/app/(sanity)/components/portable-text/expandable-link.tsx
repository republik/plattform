import { ExpandableLinkCard } from '@/app/(sanity)/components/portable-text/expandable-link-client'
import type {
  ExpandableLink as ExpandableLinkSchemaType,
  TextOnlyInlineEditor,
} from '@/sanity.types'
import { toPlainText, type PortableTextMarkComponentProps } from 'next-sanity'

type ExpandableLinkValue = ExpandableLinkSchemaType & {
  _key: string
  /** Both added by the GROQ projection when the mark points at a document instead of a URL. */
  slug?: string | null
  referenceTitle?: TextOnlyInlineEditor | string | null
}

/**
 * A contributor's title is a plain string, an article's or page's is portable
 * text. TypeGen widens `pt::text()` inside a `select()` back to that union, so
 * both shapes are normalised here.
 */
function plainTitle(title: ExpandableLinkValue['referenceTitle']) {
  if (!title) return
  const text = typeof title === 'string' ? title : toPlainText(title)
  return text.trim() || undefined
}

/**
 * Stays a server component: `PortableText` hands mark components function
 * props (`renderNode`) that cannot cross into a client component, so only the
 * serializable parts are forwarded to `ExpandableLinkCard`.
 */
export function ExpandableLink({
  text,
  value,
}: PortableTextMarkComponentProps<ExpandableLinkValue>) {
  const href = value?.href || value?.slug
  const isInternal = !value?.href && !!value?.slug

  if (!href) {
    return text
  }

  return (
    <ExpandableLinkCard
      href={href}
      isInternal={isInternal}
      description={value.content}
      // An internal reference reads better as the article's own title than as
      // a shortened path; the card falls back to the path when it has none.
      label={isInternal ? plainTitle(value.referenceTitle) : undefined}
    >
      {text}
    </ExpandableLinkCard>
  )
}
