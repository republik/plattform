/**
 * Extracts visible text from an article's Portable Text (`content`) or a
 * page's `pageBuilder`, walking custom block types explicitly (mirroring
 * republik/studio's shared/email/PortableTextEmailComponents.tsx's
 * `renderBlock` switch, type for type) rather than reading only standard
 * `_type === "block"` spans, which would silently drop image captions,
 * quotes, info boxes, etc.
 *
 * Ported from republik/studio's shared/search/blocksToPlainText.ts. There is
 * no shared package between the two repos, so a new custom Portable Text
 * block type added to studio's editor schema needs the same case added to
 * both copies by hand, or it silently drops out of this backend's
 * bulk-reindexed article search bodies (see script/reindex.ts's
 * reindexArticles) -- studio's own functions/sync-search/index.ts, which
 * uses its own copy, would still get it right.
 */

type Block = { _type: string; [key: string]: unknown }

function spanText(block: Block): string {
  const children =
    (block.children as Array<{ _type: string; text?: string }> | undefined) ?? []
  return children
    .filter((c) => c._type === 'span')
    .map((c) => c.text ?? '')
    .join('')
}

/** A field that may be a plain string or a Portable Text array (e.g. infoBox.title). */
function textFieldToPlainText(value: unknown): string {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''
  return (value as Block[])
    .filter((b) => b._type === 'block')
    .map(spanText)
    .join('\n')
}

/** Caption may be a plain string or the `caption` object ({ legend, credit }, both inline Portable Text). */
function captionToPlainText(caption: unknown): string {
  if (typeof caption === 'string') return caption
  if (!caption || typeof caption !== 'object') return ''
  const obj = caption as Record<string, unknown>
  if (obj.legend != null || obj.credit != null) {
    return [textFieldToPlainText(obj.legend), textFieldToPlainText(obj.credit)]
      .filter(Boolean)
      .join(' ')
  }
  return (obj.plainText as string | undefined) ?? (obj.text as string | undefined) ?? ''
}

function blockToPlainText(block: Block): string {
  switch (block._type) {
    case 'block':
      return spanText(block)

    case 'editorialImage':
    case 'groupedEditorialImage':
      return captionToPlainText(block.caption)

    case 'imageGroup': {
      const images = (block.images as Array<Record<string, unknown>> | undefined) ?? []
      return captionToPlainText(images[0]?.caption)
    }

    case 'blockQuote': {
      const body = (block.body as Block[] | undefined) ?? []
      const text = blocksToPlainText(body)
      const caption = captionToPlainText(block.caption)
      return [text, caption].filter(Boolean).join('\n')
    }

    case 'pullQuote':
      return [block.text as string | undefined, block.source as string | undefined]
        .filter(Boolean)
        .join('\n')

    case 'button':
      return (block.text as string | undefined) ?? ''

    case 'infoBox': {
      const title = textFieldToPlainText(block.title)
      const body = (block.body as Block[] | undefined) ?? []
      return [title, blocksToPlainText(body)].filter(Boolean).join('\n')
    }

    case 'interviewAnswer':
    case 'emailOnly':
    case 'if':
    case 'ifNot':
      return blocksToPlainText((block.body as Block[] | undefined) ?? [])

    case 'variable':
      return `*|${((block.name as string | undefined) ?? '').toUpperCase()}|*`

    // No visible text (divider, html, or web/embed-only content not relevant to search).
    case 'divider':
    case 'html':
    case 'webOnly':
    case 'embedVideo':
    case 'embedTwitter':
    case 'embedDataWrapper':
    case 'chart':
    case 'storyComponent':
    case 'seriesNav':
      return ''

    default:
      return ''
  }
}

export function blocksToPlainText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return ''
  return (blocks as Block[]).map(blockToPlainText).filter(Boolean).join('\n')
}
