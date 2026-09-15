/**
 * Converts an article's raw `byline` Portable Text (single block, see
 * republik/studio's article/byline/buildByline.ts's «von [Name](internalLink),
 * [date]» convention) into a minimal mdast-ish node array for the search
 * result Credit line -- preserving the editor's exact text/punctuation, only
 * resolving each `internalLink` span's contributor reference into a profile
 * link (`/~slug`). Text spans and spans whose link doesn't resolve to a
 * contributor slug stay plain text.
 *
 * Adapted from republik/studio's shared/search/bylineToCredits.ts: that
 * version takes a separately-fetched `contributorSlugById` map, because its
 * caller (functions/sync-search/index.ts) receives a Blueprint event payload
 * with unresolved references and must batch-resolve them itself. This
 * backend writes its own GROQ query (see lib/sanity/fetchArticles.ts) and
 * inlines each internalLink markDef's contributor slug directly via
 * `reference->slug.current`, so this version reads `markDef.contributorSlug`
 * straight off the block instead of taking a map. Keep both copies' block-
 * walking logic in sync by hand -- see blocksToPlainText.ts's module comment.
 */

type Span = { _type: string; text?: string; marks?: string[] }
type MarkDef = {
  _key: string
  _type: string
  contributorSlug?: string
}
type Block = { _type: string; children?: Span[]; markDefs?: MarkDef[] }

export type CreditsNode =
  | { type: 'text'; value: string }
  | { type: 'link'; url: string; children: [{ type: 'text'; value: string }] }

export function bylineToCredits(byline: unknown): CreditsNode[] | undefined {
  if (!Array.isArray(byline) || byline.length === 0) return undefined

  const nodes: CreditsNode[] = []
  for (const block of byline as Block[]) {
    if (block._type !== 'block') continue
    const markDefById = new Map(
      (block.markDefs ?? []).map((markDef) => [markDef._key, markDef]),
    )
    for (const span of block.children ?? []) {
      if (span._type !== 'span' || !span.text) continue
      const linkMarkKey = (span.marks ?? []).find(
        (markKey) => markDefById.get(markKey)?._type === 'internalLink',
      )
      const slug = linkMarkKey && markDefById.get(linkMarkKey)?.contributorSlug
      nodes.push(
        slug
          ? { type: 'link', url: `/~${slug}`, children: [{ type: 'text', value: span.text }] }
          : { type: 'text', value: span.text },
      )
    }
  }
  return nodes.length > 0 ? nodes : undefined
}
