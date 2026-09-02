// SANITY_SYNC (transition period, removable — see ../publikatorSync/index.ts).
//
// Ported and trimmed from studio's import/publikator/src/mdastToPortableText.ts
// (the one-time bulk-migration tool, a sibling repo, not part of this
// monorepo). That file converts one Publikator document's mdast content tree
// into Sanity portable text; this is the same per-document logic, with the
// two corpus-wide registries removed because this module only ever sees one
// document at a time (a single incoming commit), never the full corpus:
//
// - `registerMigratedPageRepos`/`migratedPageRepos`: originally let an
//   internal (autoSlug) link tell a format/section/series *page* target apart
//   from a plain article target. Without the full-corpus pre-scan that built
//   that set, every internal link here resolves to the plain article id
//   (`repoIdToSanityId`). A link to a format/section/series page will point
//   at the wrong Sanity document until the real cutover migration corrects
//   it — acceptable for a transition-period text mirror.
// - `registerContributorUsernames`/`usernameToContributorId`: originally
//   resolved a `/~username` profile link to its contributor id via a
//   corpus-wide name→userId map built from every document's
//   meta.contributors. Without it, a username-shaped link falls back to the
//   same by-name derivation the original code used for names it couldn't
//   resolve either.
import { repoIdToSanityId } from '../legacyId'
import { v5 as uuidV5 } from 'uuid'

const CONTRIBUTOR_NAMESPACE = uuidV5(
  'ch.republik.publikator.contributor',
  uuidV5.DNS,
)

// Matches generateUUID.ts#contributorToSanityUUID in studio.
const contributorToSanityUUID = (key: string) =>
  uuidV5(key.trim(), CONTRIBUTOR_NAMESPACE)

// ── MDAST types ───────────────────────────────────────────────────────────────

interface MdastText {
  type: 'text'
  value: string
}

interface MdastBreak {
  type: 'break'
}

interface MdastCode {
  type: 'code'
  lang?: string | null
  meta?: string | null
  value: string
}

interface MdastImage {
  type: 'image'
  url?: string
  alt?: string | null
  title?: string | null
}

interface MdastParent {
  type: string
  children: MdastNode[]
}

interface MdastHeading extends MdastParent {
  type: 'heading'
  depth: number
}

interface MdastList extends MdastParent {
  type: 'list'
  ordered: boolean
}

interface MdastLink extends MdastParent {
  type: 'link'
  url: string
  title?: string | null
}

interface MdastZone extends MdastParent {
  type: 'zone'
  identifier: string
  data?: Record<string, unknown>
}

type MdastNode =
  | MdastText
  | MdastBreak
  | MdastCode
  | MdastImage
  | MdastParent
  | { type: string; [k: string]: unknown }

// ── Sanity reference type ─────────────────────────────────────────────────────

export interface SanityRef {
  _type: 'reference'
  _ref: string
}

// ── Portable Text types ───────────────────────────────────────────────────────

interface PtSpan {
  _type: 'span'
  _key: string
  text: string
  marks: string[]
}

interface PtMarkDef {
  _key: string
  _type: string
  [k: string]: unknown
}

interface PtBlock {
  _type: 'block'
  _key: string
  style: string
  listItem?: string
  level?: number
  markDefs: PtMarkDef[]
  children: Array<PtSpan | PtCustomBlock>
}

type PtCustomBlock = {
  _type: string
  _key: string
  [k: string]: unknown
}

export type PortableTextItem = PtBlock | PtCustomBlock

// ── Helpers ───────────────────────────────────────────────────────────────────

// republik-assets lives in eu-central-1 (see AWS_REGION in plattform's
// apps/api/.env.example) — matches the bucket the asset server proxies via
// `/s3/{bucket}/{key}`. cdn.repub.ch and cdn.republik.space are the same
// proxy under two hostnames (the latter a legacy alias) — both forward to it.
const S3_ASSETS_REGION = 'eu-central-1'
const ASSET_SERVER_S3_RE =
  /^https?:\/\/cdn\.(?:repub\.ch|republik\.space)\/s3\/([^/]+)\/(.+)$/i

// rewrite an asset-server proxy URL (`cdn.repub.ch/s3/{bucket}/{key}` or its
// `cdn.republik.space` alias) to a direct S3 link, so Sanity fetches straight
// from S3 instead of bouncing through the asset server. Drops the CDN's
// `?size=WxH` resize query — S3 has no resizing, so the original
// full-resolution file is the closest equivalent. URLs that don't match the
// pattern pass through as-is.
export function toDirectS3Url(url: string): string {
  const match = url.match(ASSET_SERVER_S3_RE)
  if (!match) return url
  const [, bucket, keyWithQuery] = match
  const key = keyWithQuery.split('?')[0]
  return `https://${bucket}.s3.${S3_ASSETS_REGION}.amazonaws.com/${key}`
}

// `_sanityAsset: 'image@<url>'` is a marker this module leaves for
// ./assets.ts to resolve into a real uploaded asset reference before the
// document is written — see that file's header comment for why. Only
// http(s) works here; inline data: URIs (some Publikator images are base64)
// can't be fetched that way, so they are dropped rather than crashing the
// sync.
function assetRef(url: string | undefined | null): string | undefined {
  if (!url || !/^https?:\/\//i.test(url)) return undefined
  return `image@${toDirectS3Url(url)}`
}

function isAutoSlugLink(url: string): boolean {
  try {
    const u = new URL(url)
    return (
      (u.hostname === 'github.com' || u.hostname === 'www.github.com') &&
      u.pathname.startsWith('/republik/') &&
      u.searchParams.has('autoSlug')
    )
  } catch {
    return false
  }
}

// ── Key generation ────────────────────────────────────────────────────────────

function key(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}

// The article-level synthetic voice used for former interviewAnswer content.
// Set per-document at the top of `mdastToPortableText` and read by the
// INTERVIEWANSWER zone handler. Module-scoped to avoid threading it through
// every transform function (mirrors how one document is processed at a time).
let currentVoice2: string | undefined

// the document id an internal (autoSlug) link should reference. See the file
// header: without the corpus-wide migratedPageRepos set, every internal link
// resolves to the plain article id.
function internalRefId(url: string): string {
  return repoIdToSanityId(url)
}

// ── Contributor profile links (bylines) ──────────────────────────────────────

// author links point at a republik.ch profile: /~<userId> or /~<username>
const PROFILE_URL_RE =
  /^(?:https?:\/\/(?:www\.)?republik\.ch)?\/~([^/?#]+)\/?$/
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function profileSlug(url: unknown): string | undefined {
  if (typeof url !== 'string') return undefined
  return PROFILE_URL_RE.exec(url)?.[1]
}

// the contributor a profile link references: userId slugs map directly;
// username slugs fall back to a name-keyed id (no corpus-wide username→userId
// map here — see file header).
function contributorLinkId(slug: string, linkText: string): string {
  if (UUID_RE.test(slug)) return contributorToSanityUUID(slug)
  return contributorToSanityUUID(linkText)
}

// Prepend a `voiceTag` inline block (the chosen `voice`) to the start of the
// first paragraph, so a former interviewAnswer becomes a normal paragraph
// that opens with the voice marker: <p>[voiceTag]…original content</p>.
function prependVoiceTag(
  items: PortableTextItem[],
  voice: string,
): PortableTextItem[] {
  const firstBlockIdx = items.findIndex((item) => item._type === 'block')
  if (firstBlockIdx === -1) return items

  const voiceTag: PtCustomBlock = { _type: 'voiceTag', _key: key(), voice }
  const block = items[firstBlockIdx] as PtBlock
  const updated = [...items]
  updated[firstBlockIdx] = {
    ...block,
    children: [voiceTag, ...block.children],
  }
  return updated
}

// Interview answers are flagged `_isInterviewAnswer`. For each such block,
// restyle the immediately preceding block (the question) as
// `interviewQuestion`. The flag is always stripped. If there's no preceding
// block, the question is simply left unstyled.
function styleInterviewQuestions(
  items: PortableTextItem[],
): PortableTextItem[] {
  const result: PortableTextItem[] = []

  for (const item of items) {
    const isInterviewAnswer =
      item._type === 'block' &&
      (item as Record<string, unknown>)._isInterviewAnswer === true

    if (!isInterviewAnswer) {
      result.push(item)
      continue
    }

    const block = { ...(item as PtBlock) } as PtBlock & {
      _isInterviewAnswer?: boolean
    }
    delete block._isInterviewAnswer

    const prev = result[result.length - 1]
    if (prev && prev._type === 'block') {
      result[result.length - 1] = {
        ...(prev as PtBlock),
        style: 'interviewQuestion',
      }
    }

    result.push(block)
  }

  return result
}

// ── Inline transformer ────────────────────────────────────────────────────────

function inlineToSpans(
  nodes: MdastNode[],
  markDefs: PtMarkDef[],
  inheritedMarks: string[] = [],
): Array<PtSpan | PtCustomBlock> {
  const spans: Array<PtSpan | PtCustomBlock> = []

  for (const node of nodes) {
    if (node.type === 'text') {
      spans.push({
        _type: 'span',
        _key: key(),
        text: (node as MdastText).value,
        marks: [...inheritedMarks],
      })
      continue
    }

    if (node.type === 'break') {
      spans.push({
        _type: 'span',
        _key: key(),
        text: '\n',
        marks: [...inheritedMarks],
      })
      continue
    }

    if (node.type === 'image') {
      const img = node as MdastImage
      spans.push({
        _type: 'span',
        _key: key(),
        text: img.alt ?? '[image]',
        marks: [...inheritedMarks],
      })
      continue
    }

    const children = ((node as MdastParent).children ?? []) as MdastNode[]

    if (node.type === 'strong') {
      spans.push(
        ...inlineToSpans(children, markDefs, [...inheritedMarks, 'strong']),
      )
      continue
    }

    if (node.type === 'emphasis') {
      spans.push(
        ...inlineToSpans(children, markDefs, [...inheritedMarks, 'em']),
      )
      continue
    }

    if (node.type === 'sub') {
      spans.push(
        ...inlineToSpans(children, markDefs, [...inheritedMarks, 'sub']),
      )
      continue
    }

    if (node.type === 'sup') {
      spans.push(
        ...inlineToSpans(children, markDefs, [...inheritedMarks, 'sup']),
      )
      continue
    }

    if (node.type === 'link') {
      const link = node as MdastLink
      const markKey = key()
      // publikator expandable link: title is "<linkTitle>%%<description>";
      // the part after "%%" is the expandable description (plain text → PT).
      // internal (autoSlug) links become a weak reference; others keep href
      const [, description] = (link.title || '').split('%%')
      if (description) {
        markDefs.push({
          _key: markKey,
          _type: 'expandableLink',
          content: textToInlineEditor(description),
          ...(isAutoSlugLink(link.url)
            ? {
                reference: {
                  _type: 'reference',
                  _ref: internalRefId(link.url),
                  _weak: true,
                },
              }
            : { href: link.url ?? '' }),
        })
      } else if (isAutoSlugLink(link.url)) {
        const ref = internalRefId(link.url)
        markDefs.push({
          _key: markKey,
          _type: 'internalLink',
          reference: { _type: 'reference', _ref: ref, _weak: true },
        })
      } else if (profileSlug(link.url)) {
        // author profile link (byline) → internal link to the contributor
        markDefs.push({
          _key: markKey,
          _type: 'internalLink',
          reference: {
            _type: 'reference',
            _ref: contributorLinkId(
              profileSlug(link.url) as string,
              extractInlineText(children).trim(),
            ),
            _weak: true,
          },
        })
      } else {
        markDefs.push({ _key: markKey, _type: 'link', href: link.url ?? '' })
      }
      spans.push(
        ...inlineToSpans(children, markDefs, [...inheritedMarks, markKey]),
      )
      continue
    }

    if (node.type === 'span') {
      const spanData = (
        node as { type: string; data?: Record<string, unknown> }
      ).data
      const variable = spanData?.variable
      if (typeof variable === 'string') {
        spans.push({ _type: 'variable', _key: key(), name: variable })
        continue
      }
    }

    // other inline containers — flatten children
    if (children.length > 0) {
      spans.push(...inlineToSpans(children, markDefs, inheritedMarks))
    }
  }

  return spans
}

function textBlock(
  style: string,
  children: MdastNode[],
  extra?: { listItem?: string; level?: number },
): PtBlock {
  const markDefs: PtMarkDef[] = []
  const spans = inlineToSpans(children, markDefs)
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs,
    children:
      spans.length > 0
        ? spans
        : [{ _type: 'span', _key: key(), text: '', marks: [] }],
    ...extra,
  }
}

// Expandable-link descriptions are plain text — wrap into an inlineEditor
// value (a single styleless block with one span).
function textToInlineEditor(text: string): PortableTextItem[] {
  return [
    {
      _type: 'block',
      _key: key(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: key(), text: text.trim(), marks: [] }],
    },
  ]
}

// ── Block transformer ─────────────────────────────────────────────────────────

function blockToItems(
  node: MdastNode,
  listLevel = 0,
  mapAssets = false,
  insideCenter = false,
  seriesRef?: SanityRef,
): PortableTextItem[] {
  const t = node.type
  const children = ((node as MdastParent).children ?? []) as MdastNode[]

  if (t === 'paragraph') {
    return [textBlock('normal', children)]
  }

  if (t === 'heading') {
    return [textBlock('heading', children)]
  }

  if (t === 'blockquote') {
    return children.flatMap((child) =>
      blockToItems(child, listLevel, mapAssets, insideCenter, seriesRef).map(
        (item) =>
          item._type === 'block'
            ? { ...(item as PtBlock), style: 'blockquote' }
            : item,
      ),
    )
  }

  if (t === 'list') {
    const list = node as MdastList
    const listItem = list.ordered ? 'number' : 'bullet'
    const level = listLevel + 1
    return children.flatMap((child) =>
      listItemToBlocks(
        child as MdastNode,
        listItem,
        level,
        mapAssets,
        insideCenter,
        seriesRef,
      ),
    )
  }

  if (t === 'code') {
    const code = node as MdastCode
    return [
      {
        _type: 'codeBlock',
        _key: key(),
        language: code.lang ?? null,
        code: code.value,
      },
    ]
  }

  if (t === 'thematicBreak') {
    return [{ _type: 'divider', _key: key() }]
  }

  if (t === 'zone') {
    return zoneToItems(
      node as unknown as MdastZone,
      mapAssets,
      insideCenter,
      seriesRef,
    )
  }

  // unknown block node — recurse into children
  if (children.length > 0) {
    return children.flatMap((child) =>
      blockToItems(child, listLevel, mapAssets, insideCenter, seriesRef),
    )
  }

  return []
}

function listItemToBlocks(
  node: MdastNode,
  listItem: string,
  level: number,
  mapAssets = false,
  insideCenter = false,
  seriesRef?: SanityRef,
): PortableTextItem[] {
  const children = ((node as MdastParent).children ?? []) as MdastNode[]
  const result: PortableTextItem[] = []

  for (const child of children) {
    if (child.type === 'paragraph') {
      result.push(
        textBlock(
          'normal',
          ((child as MdastParent).children ?? []) as MdastNode[],
          {
            listItem,
            level,
          },
        ),
      )
    } else {
      result.push(
        ...blockToItems(child, level, mapAssets, insideCenter, seriesRef),
      )
    }
  }

  return result
}

// ── Zone transformer ──────────────────────────────────────────────────────────

// invisible characters that make a text look empty without being whitespace:
// zero-widths/directional marks (U+200B–U+200F), word joiner + invisible
// operators (U+2060–U+2064 — Publikator uses U+2063 as an empty-lead
// placeholder), BOM and soft hyphen. Used for EMPTINESS CHECKS ONLY — never
// strip these from real content (soft hyphens matter inside words).
const INVISIBLE_CHARS_RE = /[​-‏⁠-⁤﻿­]/g

export function visibleText(text: string): string {
  return text.replace(INVISIBLE_CHARS_RE, '').trim()
}

// empty paragraphs (text blocks whose spans are all whitespace, with no
// inline objects) are layout noise in Publikator documents — dropped
// everywhere. Runs after styleInterviewQuestions, so a block that received a
// voiceTag is no longer empty and survives.
function dropEmptyBlocks(items: PortableTextItem[]): PortableTextItem[] {
  return items.filter((item) => {
    if (item._type !== 'block') return true
    return (item as PtBlock).children.some(
      (c) => c._type !== 'span' || visibleText((c as PtSpan).text) !== '',
    )
  })
}

function transformChildren(
  nodes: MdastNode[],
  mapAssets = false,
  insideCenter = false,
  seriesRef?: SanityRef,
): PortableTextItem[] {
  return dropEmptyBlocks(
    styleInterviewQuestions(
      nodes.flatMap((n) =>
        blockToItems(n, 0, mapAssets, insideCenter, seriesRef),
      ),
    ),
  )
}

function zoneMarkers(
  identifier: string,
  data: Record<string, unknown> | undefined,
  innerItems: PortableTextItem[],
): PortableTextItem[] {
  const openKey = key()
  const result: PortableTextItem[] = []
  result.push({
    _type: 'zoneMarker',
    _key: openKey,
    role: 'open',
    identifier,
    ...(data && Object.keys(data).length > 0
      ? { data: JSON.stringify(data) }
      : {}),
  })
  result.push(...innerItems)
  result.push({
    _type: 'zoneMarker',
    _key: key(),
    role: 'close',
    identifier,
    openKey,
  })
  return result
}

// "tiny" → TINY exists only on editorial images; the other sized blocks
// (embeds, charts, dynamic/story components) don't support it.
function mapFigureSize(size: unknown, allowTiny = false): string {
  if (size === 'full') return 'FULL'
  if (size === 'large' || size === 'breakout') return 'BREAKOUT'
  if (allowTiny && size === 'tiny') return 'TINY'
  return 'NORMAL'
}

function mapGroupSize(size: unknown): string {
  if (size === 'narrow') return 'NARROW'
  if (size === 'normal') return 'NORMAL'
  return 'BREAKOUT' // "breakout", "large", undefined → default is breakout
}

function mapChartSize(size: unknown): string {
  if (size === 'floatTiny' || size === 'float-tiny') return 'FLOAT_TINY'
  if (size === 'narrow') return 'NARROW'
  if (size === 'breakout') return 'BREAKOUT'
  return 'NORMAL'
}

function extractInlineText(nodes: MdastNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === 'text') return (n as MdastText).value
      const kids = ((n as MdastParent).children ?? []) as MdastNode[]
      return kids.length > 0 ? extractInlineText(kids) : ''
    })
    .join('')
}

// ── Embed helpers ─────────────────────────────────────────────────────────────

// Strip undefined/null entries so embed objects only carry fields actually present.
function compact(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null),
  )
}

const dStr = (v: unknown): string | undefined =>
  typeof v === 'string' && v ? v : undefined
const dNum = (v: unknown): number | undefined =>
  typeof v === 'number' ? v : undefined
const dBool = (v: unknown): boolean | undefined =>
  typeof v === 'boolean' ? v : undefined
const dStrArray = (v: unknown): string[] | undefined =>
  Array.isArray(v) && v.length > 0
    ? v.filter((x): x is string => typeof x === 'string')
    : undefined

// The embedded resource URL (tweet/video/comment) lives in a child <link> node.
function firstLinkUrl(nodes: MdastNode[]): string | undefined {
  for (const n of nodes) {
    if (n.type === 'link') {
      const url = (n as MdastLink).url
      if (typeof url === 'string' && url) return url
    }
    const kids = ((n as MdastParent).children ?? []) as MdastNode[]
    if (kids.length > 0) {
      const found = firstLinkUrl(kids)
      if (found) return found
    }
  }
  return undefined
}

// Serialize a small subset of MDAST (comment content) to a markdown string.
function inlineMarkdown(nodes: MdastNode[]): string {
  return nodes
    .map((n) => {
      const kids = ((n as MdastParent).children ?? []) as MdastNode[]
      switch (n.type) {
        case 'text':
          return (n as MdastText).value
        case 'break':
          return '\n'
        case 'emphasis':
          return `*${inlineMarkdown(kids)}*`
        case 'strong':
          return `**${inlineMarkdown(kids)}**`
        case 'inlineCode':
          return `\`${(n as { value?: string }).value ?? ''}\``
        case 'link':
          return `[${inlineMarkdown(kids)}](${(n as MdastLink).url})`
        default:
          return kids.length > 0 ? inlineMarkdown(kids) : ''
      }
    })
    .join('')
}

function blockMarkdown(nodes: MdastNode[]): string {
  const parts: string[] = []
  for (const n of nodes) {
    const kids = ((n as MdastParent).children ?? []) as MdastNode[]
    switch (n.type) {
      case 'heading':
        parts.push(
          `${'#'.repeat((n as MdastHeading).depth ?? 1)} ${inlineMarkdown(kids)}`,
        )
        break
      case 'list': {
        const ordered = (n as MdastList).ordered
        parts.push(
          kids
            .map((li, i) => {
              const prefix = ordered ? `${i + 1}. ` : '- '
              return (
                prefix +
                inlineMarkdown(
                  ((li as MdastParent).children ?? []) as MdastNode[],
                ).trim()
              )
            })
            .join('\n'),
        )
        break
      }
      case 'blockquote':
        parts.push(
          blockMarkdown(kids)
            .split('\n')
            .map((l) => `> ${l}`)
            .join('\n'),
        )
        break
      case 'code':
        parts.push('```\n' + ((n as MdastCode).value ?? '') + '\n```')
        break
      case 'thematicBreak':
        parts.push('---')
        break
      default:
        parts.push(inlineMarkdown(kids.length > 0 ? kids : [n]))
    }
  }
  return parts.join('\n\n').trim()
}

function commentContentToMarkdown(content: unknown): string | undefined {
  if (content == null || typeof content !== 'object') return undefined
  const nodes = ((content as MdastParent).children ?? []) as MdastNode[]
  if (nodes.length === 0) return undefined
  return blockMarkdown(nodes) || undefined
}

type CaptionPt = {
  _type: 'caption'
  legend: PortableTextItem[]
  credit: PortableTextItem[]
}

function splitCaption(captionNodes: MdastNode[]): CaptionPt | undefined {
  const legendInline: MdastNode[] = []
  const creditInline: MdastNode[] = []

  for (const node of captionNodes) {
    if (node.type === 'paragraph') {
      for (const child of ((node as MdastParent).children ??
        []) as MdastNode[]) {
        if (child.type === 'emphasis') {
          creditInline.push(
            ...(((child as MdastParent).children ?? []) as MdastNode[]),
          )
        } else {
          legendInline.push(child)
        }
      }
    }
  }

  function trimNodes(nodes: MdastNode[]): MdastNode[] {
    let start = 0
    let end = nodes.length
    while (
      start < end &&
      nodes[start].type === 'text' &&
      (nodes[start] as MdastText).value.trim() === ''
    )
      start++
    while (
      end > start &&
      nodes[end - 1].type === 'text' &&
      (nodes[end - 1] as MdastText).value.trim() === ''
    )
      end--
    return nodes.slice(start, end)
  }

  const legend = trimNodes(legendInline)
  const credit = trimNodes(creditInline)

  if (legend.length === 0 && credit.length === 0) return undefined

  return {
    _type: 'caption',
    legend: legend.length > 0 ? [textBlock('normal', legend)] : [],
    credit: credit.length > 0 ? [textBlock('normal', credit)] : [],
  }
}

function extractEditorialImage(
  zone: MdastZone,
  mapAssets = false,
  insideCenter = false,
): PtCustomBlock {
  const children = (zone.children ?? []) as MdastNode[]
  let url: string | null = null
  let darkUrl: string | null = null
  let alt: string | null = null
  const captionNodes: MdastNode[] = []

  for (const child of children) {
    if (child.type === 'paragraph') {
      const para = child as MdastParent
      const paraChildren = (para.children ?? []) as MdastNode[]
      const imgNodes = paraChildren.filter(
        (c) => c.type === 'image',
      ) as MdastImage[]

      if (imgNodes.length > 0 && url === null) {
        url = imgNodes[0].url ?? null
        alt = imgNodes[0].alt ?? null
        if (imgNodes.length > 1) darkUrl = imgNodes[1].url ?? null
        const nonImage = paraChildren.filter(
          (c) =>
            c.type !== 'image' &&
            !(c.type === 'text' && (c as MdastText).value.trim() === ''),
        )
        if (nonImage.length > 0) {
          captionNodes.push({
            type: 'paragraph',
            children: nonImage,
          } as MdastParent)
        }
      } else {
        captionNodes.push(child)
      }
    } else {
      captionNodes.push(child)
    }
  }

  const caption = splitCaption(captionNodes)
  const size =
    zone.data?.size != null
      ? mapFigureSize(zone.data.size, true)
      : insideCenter
        ? 'NORMAL'
        : 'FULL'

  return {
    _type: 'editorialImage',
    _key: key(),
    ...(mapAssets && assetRef(url) ? { _sanityAsset: assetRef(url) } : {}),
    ...(mapAssets && assetRef(darkUrl)
      ? { imageDark: { _type: 'image', _sanityAsset: assetRef(darkUrl) } }
      : {}),
    alt: alt ?? undefined,
    ...(caption ? { caption } : {}),
    size,
  }
}

function extractGroupedImage(
  zone: MdastZone,
  mapAssets = false,
): PtCustomBlock {
  const children = (zone.children ?? []) as MdastNode[]
  let url: string | null = null
  let darkUrl: string | null = null
  let alt: string | null = null
  const captionNodes: MdastNode[] = []

  for (const child of children) {
    if (child.type === 'paragraph') {
      const para = child as MdastParent
      const paraChildren = (para.children ?? []) as MdastNode[]
      const imgNodes = paraChildren.filter(
        (c) => c.type === 'image',
      ) as MdastImage[]

      if (imgNodes.length > 0 && url === null) {
        url = imgNodes[0].url ?? null
        alt = imgNodes[0].alt ?? null
        if (imgNodes.length > 1) darkUrl = imgNodes[1].url ?? null
        const nonImage = paraChildren.filter(
          (c) =>
            c.type !== 'image' &&
            !(c.type === 'text' && (c as MdastText).value.trim() === ''),
        )
        if (nonImage.length > 0) {
          captionNodes.push({
            type: 'paragraph',
            children: nonImage,
          } as MdastParent)
        }
      } else {
        captionNodes.push(child)
      }
    } else {
      captionNodes.push(child)
    }
  }

  const caption = splitCaption(captionNodes)

  return {
    _type: 'groupedEditorialImage',
    _key: key(),
    ...(mapAssets && assetRef(url) ? { _sanityAsset: assetRef(url) } : {}),
    ...(mapAssets && assetRef(darkUrl)
      ? { imageDark: { _type: 'image', _sanityAsset: assetRef(darkUrl) } }
      : {}),
    alt: alt ?? undefined,
    ...(caption ? { caption } : {}),
  }
}

const seenUnknownZones = new Set<string>()

function zoneToItems(
  zone: MdastZone,
  mapAssets = false,
  insideCenter = false,
  seriesRef?: SanityRef,
): PortableTextItem[] {
  const id = zone.identifier
  const data = zone.data ?? {}
  const children = (zone.children ?? []) as MdastNode[]

  // TITLE's content is already captured in document-level metadata via
  // extractTitleZoneData.
  if (id === 'TITLE') return []

  // AUTHOR: a newsletter sign-off card. `resolvedAuthor` is a snapshot taken
  // at send-time, so only the deterministic authorId is trusted for the
  // reference — the rest becomes a per-block override.
  if (id === 'AUTHOR') {
    const resolvedAuthor = (data.resolvedAuthor ?? {}) as Record<
      string,
      unknown
    >
    const authorId = data.authorId as string | undefined
    if (!authorId) return []
    const credentials =
      (resolvedAuthor.credentials as
        Array<Record<string, unknown>> | undefined) ?? []
    const listed = credentials.filter((c) => c.isListed)
    const credentialText = listed.length
      ? listed.map((c) => c.description as string).join(', ')
      : undefined
    return [
      {
        _type: 'authorBlock',
        _key: key(),
        contributor: {
          _type: 'reference',
          _ref: contributorToSanityUUID(authorId),
        },
        credentialText,
        large: Boolean(data.isLarge),
      },
    ]
  }

  if (id === 'CENTER') {
    return transformChildren(children, mapAssets, true, seriesRef)
  }

  if (id === 'FIGURE') {
    return [extractEditorialImage(zone, mapAssets, insideCenter)]
  }

  if (id === 'FIGUREGROUP') {
    const images = children
      .filter(
        (c) =>
          (c as MdastZone).type === 'zone' &&
          (c as MdastZone).identifier === 'FIGURE',
      )
      .map((c) => extractGroupedImage(c as MdastZone, mapAssets))
    const captionNodes = children.filter(
      (c) =>
        !(
          (c as MdastZone).type === 'zone' &&
          (c as MdastZone).identifier === 'FIGURE'
        ),
    )
    const caption = splitCaption(captionNodes)
    return [
      {
        _type: 'imageGroup',
        _key: key(),
        images,
        ...(caption ? { caption } : {}),
        size: mapGroupSize(data.size),
      },
    ]
  }

  if (id === 'INFOBOX') {
    let title: string | null = null
    let startIdx = 0
    if (
      children[0]?.type === 'heading' &&
      (children[0] as MdastHeading).depth === 3
    ) {
      const spans = inlineToSpans(
        ((children[0] as MdastParent).children ?? []) as MdastNode[],
        [],
      )
      title = spans.map((s) => s.text).join('')
      startIdx = 1
    }

    let imageUrl: string | null = null
    const remaining = children.slice(startIdx)
    const figIdx = remaining.findIndex(
      (c) =>
        (c as MdastZone).type === 'zone' &&
        (c as MdastZone).identifier === 'FIGURE',
    )
    let bodyChildren: MdastNode[]
    let imageCaption: CaptionPt | undefined
    if (figIdx !== -1) {
      const figureZone = remaining[figIdx] as MdastZone
      bodyChildren = [
        ...remaining.slice(0, figIdx),
        ...remaining.slice(figIdx + 1),
      ]
      const figKids = (figureZone.children ?? []) as MdastNode[]
      const captionNodes: MdastNode[] = []
      for (const figChild of figKids) {
        if (figChild.type === 'paragraph') {
          const paraKids = ((figChild as MdastParent).children ??
            []) as MdastNode[]
          const imgNode = paraKids.find((c) => c.type === 'image') as
            MdastImage | undefined
          if (imgNode && imageUrl === null) {
            imageUrl = imgNode.url ?? null
          } else {
            captionNodes.push(figChild)
          }
        } else {
          captionNodes.push(figChild)
        }
      }
      imageCaption = splitCaption(captionNodes)
    } else {
      bodyChildren = remaining
    }

    const imageField =
      mapAssets && assetRef(imageUrl)
        ? {
            _type: 'image',
            _sanityAsset: assetRef(imageUrl),
            ...(imageCaption ? { caption: imageCaption } : {}),
          }
        : undefined

    return [
      {
        _type: 'infoBox',
        _key: key(),
        ...(title ? { title } : {}),
        ...(imageField ? { image: imageField } : {}),
        body: transformChildren(
          bodyChildren,
          mapAssets,
          insideCenter,
          seriesRef,
        ).map((item) =>
          item._type === 'block' && (item as PtBlock).style === 'heading'
            ? { ...(item as PtBlock), style: 'h3' }
            : item,
        ),
        ...(data.size ? { size: data.size } : {}),
        ...(data.figureSize ? { figureSize: data.figureSize } : {}),
        ...(data.figureFloat != null ? { figureFloat: data.figureFloat } : {}),
        ...(data.collapsable != null ? { collapsible: data.collapsable } : {}),
      },
    ]
  }

  if (id === 'BLOCKQUOTE') {
    const bodyNodes: MdastNode[] = []
    const attributionNodes: MdastNode[] = []
    for (const child of children) {
      if (child.type === 'blockquote') {
        bodyNodes.push(
          ...(((child as MdastParent).children ?? []) as MdastNode[]),
        )
      } else {
        attributionNodes.push(child)
      }
    }
    const caption = splitCaption(attributionNodes)
    return [
      {
        _type: 'blockQuote',
        _key: key(),
        body: transformChildren(bodyNodes, mapAssets, insideCenter, seriesRef),
        ...(caption ? { caption } : {}),
      },
    ]
  }

  if (id === 'QUOTE') {
    const quoteZones: MdastZone[] = []
    const paragraphs: MdastNode[] = []
    for (const child of children) {
      if ((child as MdastZone).type === 'zone')
        quoteZones.push(child as MdastZone)
      else if (child.type === 'paragraph') paragraphs.push(child)
    }

    let text: string | undefined
    let source: string | undefined

    if (paragraphs.length >= 2) {
      text =
        extractInlineText(
          ((paragraphs[0] as MdastParent).children ?? []) as MdastNode[],
        ) || undefined
      source =
        extractInlineText(
          ((paragraphs[paragraphs.length - 1] as MdastParent).children ??
            []) as MdastNode[],
        ) || undefined
    } else if (paragraphs.length === 1) {
      text =
        extractInlineText(
          ((paragraphs[0] as MdastParent).children ?? []) as MdastNode[],
        ) || undefined
    }

    let imageField: PtCustomBlock['image'] | undefined
    if (quoteZones.length > 0) {
      const figZone = quoteZones[0]
      const figKids = (figZone.children ?? []) as MdastNode[]
      let imageUrl: string | null = null
      const captionNodes: MdastNode[] = []
      for (const figChild of figKids) {
        if (figChild.type === 'paragraph') {
          const paraKids = ((figChild as MdastParent).children ??
            []) as MdastNode[]
          const imgNode = paraKids.find((c) => c.type === 'image') as
            MdastImage | undefined
          if (imgNode && imageUrl === null) {
            imageUrl = imgNode.url ?? null
          } else {
            captionNodes.push(figChild)
          }
        } else {
          captionNodes.push(figChild)
        }
      }
      const imageCaption = splitCaption(captionNodes)
      if (mapAssets && assetRef(imageUrl)) {
        imageField = {
          _type: 'image',
          _sanityAsset: assetRef(imageUrl),
          ...(imageCaption ? { caption: imageCaption } : {}),
        }
      }
    }

    return [
      {
        _type: 'pullQuote',
        _key: key(),
        ...(text ? { text } : {}),
        ...(source ? { source } : {}),
        ...(imageField ? { image: imageField } : {}),
        ...(data.size ? { size: data.size } : {}),
      },
    ]
  }

  if (id === 'NOTE') {
    return transformChildren(children, mapAssets, insideCenter, seriesRef).map(
      (item) =>
        item._type === 'block' ? { ...(item as PtBlock), style: 'note' } : item,
    )
  }

  if (id === 'INTERVIEWANSWER') {
    const items = transformChildren(
      children,
      mapAssets,
      insideCenter,
      seriesRef,
    )
    const withTag = currentVoice2
      ? prependVoiceTag(items, currentVoice2)
      : items
    const firstBlockIdx = withTag.findIndex((item) => item._type === 'block')
    if (firstBlockIdx !== -1) {
      (withTag[firstBlockIdx] as Record<string, unknown>)._isInterviewAnswer =
        true
    }
    return withTag
  }

  if (id === 'WEBONLY') {
    return [
      {
        _type: 'webOnly',
        _key: key(),
        body: transformChildren(children, mapAssets, insideCenter, seriesRef),
      },
    ]
  }

  if (id === 'EMAILONLY') {
    return [
      {
        _type: 'emailOnly',
        _key: key(),
        body: transformChildren(children, mapAssets, insideCenter, seriesRef),
      },
    ]
  }

  if (id === 'IF') {
    const ifChildren: MdastNode[] = []
    let elseChildren: MdastNode[] = []
    for (const child of children) {
      const z = child as MdastZone
      if (z.type === 'zone' && z.identifier === 'ELSE') {
        elseChildren = (z.children ?? []) as MdastNode[]
      } else {
        ifChildren.push(child)
      }
    }
    const present = data.present != null ? String(data.present) : undefined
    const blocks: PortableTextItem[] = [
      {
        _type: 'if',
        _key: key(),
        ...(present ? { present } : {}),
        body: transformChildren(ifChildren, mapAssets, insideCenter, seriesRef),
      },
    ]
    if (elseChildren.length > 0) {
      blocks.push({
        _type: 'ifNot',
        _key: key(),
        ...(present ? { present } : {}),
        body: transformChildren(
          elseChildren,
          mapAssets,
          insideCenter,
          seriesRef,
        ),
      })
    }
    return blocks
  }

  if (id === 'CHART') {
    const rem = [...children]

    const chartPt = (node: MdastNode | undefined): PtBlock[] | undefined => {
      if (!node) return undefined
      const blk = textBlock(
        'normal',
        ((node as MdastParent).children ?? []) as MdastNode[],
      )
      return dropEmptyBlocks([blk]).length > 0 ? [blk] : undefined
    }

    const h3i = rem.findIndex(
      (c) => c.type === 'heading' && (c as MdastHeading).depth === 3,
    )
    const titlePt = chartPt(h3i !== -1 ? rem.splice(h3i, 1)[0] : undefined)

    const p1i = rem.findIndex((c) => c.type === 'paragraph')
    const leadPt = chartPt(p1i !== -1 ? rem.splice(p1i, 1)[0] : undefined)

    const ci = rem.findIndex((c) => c.type === 'code')
    const csvData =
      ci !== -1 ? (rem.splice(ci, 1)[0] as MdastCode).value : undefined

    const p2i = rem.findIndex((c) => c.type === 'paragraph')
    const sourcePt = chartPt(p2i !== -1 ? rem.splice(p2i, 1)[0] : undefined)

    const { size: rawChartSize, ...chartSettings } = data

    return [
      {
        _type: 'chart',
        _key: key(),
        ...(titlePt ? { title: titlePt } : {}),
        ...(leadPt ? { description: leadPt } : {}),
        chartConfig: {
          ...(Object.keys(chartSettings).length > 0
            ? {
                settings: {
                  _type: 'code',
                  language: 'json',
                  code: JSON.stringify(chartSettings),
                },
              }
            : {}),
          ...(csvData !== undefined
            ? { data: { _type: 'code', language: 'csv', code: csvData } }
            : {}),
        },
        ...(sourcePt ? { source: sourcePt } : {}),
        size: mapChartSize(rawChartSize),
      },
    ]
  }

  if (id === 'EMBEDVIDEO') {
    const rawSrc =
      data.src != null && typeof data.src === 'object'
        ? (data.src as Record<string, unknown>)
        : undefined
    const src = rawSrc
      ? compact({
          mp4: dStr(rawSrc.mp4),
          hls: dStr(rawSrc.hls),
          thumbnail: dStr(rawSrc.thumbnail),
        })
      : undefined
    const hasSrc = !!src && Object.keys(src).length > 0

    if (dBool(data.forceAudio) === true && hasSrc) {
      return [
        compact({
          _type: 'audio',
          _key: key(),
          size: mapFigureSize(data.size),
          title: dStr(data.title),
          legacyAudioSrc: compact({
            mp4: dStr(rawSrc?.mp4),
            hls: dStr(rawSrc?.hls),
          }),
        }) as PortableTextItem,
      ]
    }

    return [
      compact({
        _type: 'embedVideo',
        _key: key(),
        size: mapFigureSize(data.size),
        platform: dStr(data.platform),
        url: firstLinkUrl(children),
        id: dStr(data.id),
        title: dStr(data.title),
        createdAt: dStr(data.createdAt),
        retrievedAt: dStr(data.retrievedAt),
        userName: dStr(data.userName),
        userUrl: dStr(data.userUrl),
        userProfileImageUrl: dStr(data.userProfileImageUrl),
        thumbnail: dStr(data.thumbnail),
        aspectRatio: dNum(data.aspectRatio),
        durationMs: dNum(data.durationMs),
        mediaId: dStr(data.mediaId),
        src: hasSrc ? src : undefined,
      }) as PortableTextItem,
    ]
  }

  if (id === 'EMBEDTWITTER') {
    return [
      compact({
        _type: 'embedTwitter',
        _key: key(),
        url: firstLinkUrl(children),
        id: dStr(data.id),
        createdAt: dStr(data.createdAt),
        retrievedAt: dStr(data.retrievedAt),
        text: dStr(data.text),
        html: dStr(data.html),
        userId: dStr(data.userId),
        userName: dStr(data.userName),
        userScreenName: dStr(data.userScreenName),
        userProfileImageUrl: dStr(data.userProfileImageUrl),
        image: dStr(data.image),
        more: dStr(data.more),
        playable: dBool(data.playable),
      }) as PortableTextItem,
    ]
  }

  if (id === 'EMBEDCOMMENT') {
    const rawDiscussion =
      data.discussion != null && typeof data.discussion === 'object'
        ? (data.discussion as Record<string, unknown>)
        : undefined
    const discussion = rawDiscussion
      ? compact({
          id: dStr(rawDiscussion.id),
          path: dStr(rawDiscussion.path),
          title: dStr(rawDiscussion.title),
        })
      : undefined
    return [
      compact({
        _type: 'embedComment',
        _key: key(),
        id: dStr(data.id),
        content: commentContentToMarkdown(data.content),
        tags: dStrArray(data.tags),
        createdAt: dStr(data.createdAt),
        updatedAt: dStr(data.updatedAt),
        parentIds: dStrArray(data.parentIds),
        discussion:
          discussion && Object.keys(discussion).length > 0
            ? discussion
            : undefined,
      }) as PortableTextItem,
    ]
  }

  if (id === 'EMBEDDATAWRAPPER') {
    const size =
      data.size != null
        ? mapFigureSize(data.size)
        : insideCenter
          ? 'NORMAL'
          : 'FULL'
    return [
      {
        _type: 'embedDataWrapper',
        _key: key(),
        datawrapperId:
          typeof data.datawrapperId === 'string'
            ? data.datawrapperId
            : undefined,
        forceDark: data.forceDark === true ? true : undefined,
        plain: data.plain === true ? true : undefined,
        size,
      },
    ]
  }

  if (id === 'HTML') {
    const codeNode = children.find((c) => c.type === 'code') as
      MdastCode | undefined
    const html =
      codeNode?.value ??
      children
        .flatMap((c) => ((c as MdastParent).children ?? [c]) as MdastNode[])
        .filter((c) => c.type === 'text')
        .map((c) => (c as MdastText).value)
        .join('')
    return [{ _type: 'html', _key: key(), html }]
  }

  if (id === 'DYNAMIC_COMPONENT') {
    const props =
      data.props != null && typeof data.props === 'object'
        ? data.props
        : undefined
    const size =
      data.size != null
        ? mapFigureSize(data.size)
        : insideCenter
          ? 'NORMAL'
          : 'FULL'
    const ssrHtml = (
      children.find((c) => c.type === 'code') as MdastCode | undefined
    )?.value
    return [
      {
        _type: 'dynamicComponent',
        _key: key(),
        size,
        src: typeof data.src === 'string' && data.src ? data.src : undefined,
        identifier:
          typeof data.identifier === 'string' && data.identifier
            ? data.identifier
            : undefined,
        props:
          props && Object.keys(props as object).length > 0
            ? { _type: 'code', language: 'json', code: JSON.stringify(props) }
            : undefined,
        autoHtml: data.autoHtml === true ? true : undefined,
        html: ssrHtml
          ? { _type: 'code', language: 'html', code: ssrHtml }
          : undefined,
      },
    ]
  }

  if (id === 'STORYCOMPONENT') {
    const componentData =
      data.componentData != null && typeof data.componentData === 'object'
        ? data.componentData
        : undefined
    const size =
      data.size != null
        ? mapFigureSize(data.size)
        : insideCenter
          ? 'NORMAL'
          : 'FULL'
    return [
      {
        _type: 'storyComponent',
        _key: key(),
        url: typeof data.url === 'string' ? data.url : undefined,
        tagname: typeof data.tagname === 'string' ? data.tagname : undefined,
        componentData: componentData
          ? {
              _type: 'code',
              language: 'json',
              code: JSON.stringify(componentData),
            }
          : undefined,
        size,
      },
    ]
  }

  if (id === 'SERIES_NAV') {
    return [
      {
        _type: 'seriesNav',
        _key: key(),
        ...(seriesRef ? { series: seriesRef } : {}),
      },
    ]
  }

  if (id === 'BUTTON') {
    const firstPara = children.find((c) => c.type === 'paragraph') as
      MdastParent | undefined
    const spans = firstPara
      ? inlineToSpans((firstPara.children ?? []) as MdastNode[], [])
      : []
    const text = spans.map((s) => s.text).join('')
    return [
      {
        _type: 'button',
        _key: key(),
        text,
        url:
          firstLinkUrl(children) ??
          (typeof data.url === 'string' ? data.url : undefined),
      },
    ]
  }

  // All other zone types (TEASER, TEASERGROUP, SERIES_NAV, LIVETEASER,
  // ARTICLECOLLECTION, LOGBOOK, ELSE, and any custom components) →
  // zoneMarker pair so no content is silently dropped and structure is
  // preserved for rendering.
  if (!seenUnknownZones.has(id)) {
    seenUnknownZones.add(id)
    // eslint-disable-next-line no-console
    console.warn(`[sanity/publikatorSync] unhandled zone: ${id}`)
  }
  return zoneMarkers(
    id,
    Object.keys(data).length > 0 ? data : undefined,
    transformChildren(children, mapAssets, insideCenter, seriesRef),
  )
}

// ── Title zone extraction ─────────────────────────────────────────────────────

// inlineEditor fields hold a single styleless block (max 1 enforced by schema)
function inlineEditorBlock(
  children: MdastNode[],
): PortableTextItem[] | undefined {
  const blk = textBlock('normal', children)
  const text = visibleText(
    blk.children
      .map((c) => (c._type === 'span' ? (c as PtSpan).text : ''))
      .join(''),
  )
  return text ? [blk] : undefined
}

export function inlineEditorFromString(text: string): PortableTextItem[] {
  return [textBlock('normal', [{ type: 'text', value: text }])]
}

export interface TitleZoneData {
  title?: PortableTextItem[]
  description?: PortableTextItem[]
  byline?: PortableTextItem[]
  cover?: PtCustomBlock
}

// TITLE zone: h1 → title, first p → description (lead), second p → byline.
// A root-level FIGURE zone before the TITLE zone → cover.
export function extractTitleZoneData(
  nodes: unknown[],
  mapAssets = false,
): TitleZoneData {
  const children = nodes as MdastNode[]
  const result: TitleZoneData = {}

  const titleIdx = children.findIndex(
    (n) =>
      (n as MdastZone).type === 'zone' &&
      (n as MdastZone).identifier === 'TITLE',
  )
  if (titleIdx === -1) return result

  const coverZone = children
    .slice(0, titleIdx)
    .find(
      (n) =>
        (n as MdastZone).type === 'zone' &&
        (n as MdastZone).identifier === 'FIGURE',
    )
  if (coverZone) {
    const { _key, ...cover } = extractEditorialImage(
      coverZone as MdastZone,
      mapAssets,
      false,
    )
    result.cover = cover as PtCustomBlock
  }

  const titleKids = ((children[titleIdx] as MdastZone).children ??
    []) as MdastNode[]
  const h1 = titleKids.find(
    (c) => c.type === 'heading' && (c as MdastHeading).depth === 1,
  ) as MdastHeading | undefined
  const paragraphs = titleKids.filter(
    (c) => c.type === 'paragraph',
  ) as MdastParent[]

  if (h1) result.title = inlineEditorBlock((h1.children ?? []) as MdastNode[])
  if (paragraphs[0])
    result.description = inlineEditorBlock(
      (paragraphs[0].children ?? []) as MdastNode[],
    )
  if (paragraphs[1])
    result.byline = inlineEditorBlock(
      (paragraphs[1].children ?? []) as MdastNode[],
    )

  return result
}

// the body of a doc: everything except the title block (handled separately
// via extractTitleZoneData) — that is, drop the TITLE zone and the cover
// figure (the FIGURE zone right before it). AUTHOR zones stay.
export function bodyChildren(rootChildren: unknown[]): unknown[] {
  const kids = rootChildren as MdastNode[]
  const titleIdx = kids.findIndex(
    (c) => c?.type === 'zone' && (c as MdastZone).identifier === 'TITLE',
  )
  if (titleIdx < 0) return kids // no title block → whole doc is body
  const coverIdx = kids.findIndex(
    (c, i) =>
      i < titleIdx &&
      c?.type === 'zone' &&
      (c as MdastZone).identifier === 'FIGURE',
  )
  return kids.filter((c, i) => {
    if (i === coverIdx) return false
    return !(c?.type === 'zone' && (c as MdastZone).identifier === 'TITLE')
  })
}

// ── Main export ───────────────────────────────────────────────────────────────

export function mdastToPortableText(
  nodes: unknown[],
  mapAssets = false,
  seriesRef?: SanityRef,
  voice2?: string,
): PortableTextItem[] {
  currentVoice2 = voice2
  return dropEmptyBlocks(
    styleInterviewQuestions(
      (nodes as MdastNode[]).flatMap((node) =>
        blockToItems(node, 0, mapAssets, false, seriesRef),
      ),
    ),
  )
}
