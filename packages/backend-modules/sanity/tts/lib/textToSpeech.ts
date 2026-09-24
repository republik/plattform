import { toPlainText } from '@portabletext/toolkit'

// Converts the article's portable text `content` into Huebsch's speakable
// block format. `articleEditor`'s "heading" block style
// (schema/_editor/articleEditor.ts, "Zwischentitel") is the replacement for
// the old mdast subtitle node — there is no separate "subtitle" style,
// heading IS the subtitle now — so it gets the same before/after pause
// framing the old subtitle paragraphs did.
//
// Content node coverage (see schema/_editor/objects/ in the studio repo): each
// node type gets its own small transform registered in `nodeTransforms`
// below — that registry is the readable index of what's handled and why.
// `voiceTag` (per-speaker voice switching within a block) is handled
// separately in `splitBlockByVoiceTag`, since it's an inline child, not a
// content node in its own right.

const TTS_NOTICE =
  'Dieser Beitrag wird von einer synthetischen Stimme vorgelesen.'

export class SpeakableContentError extends Error {}

// Portable text: a heterogeneous array of block/object nodes. The exact
// per-node shape is defined by studio's schema (a separate repo, no shared
// type package) — modeling it precisely would drift the moment that schema
// changes without this repo knowing, so `unknown[]` documents "an array of
// *something*" honestly rather than a stale, falsely-precise type.
type PortableTextBlocks = unknown[]

export interface SpeakableSource {
  title?: PortableTextBlocks
  description?: PortableTextBlocks
  byline?: PortableTextBlocks
  content?: PortableTextBlocks
  // Structured credits (studio's `contributorEntry`: a free-text `kind`
  // plus a contributor reference), kept in sync with `byline` by studio's
  // sync-contributors Function. The preferred source for the spoken credits
  // notice — see authorsFromContributors below.
  contributors?: { kind?: string; name?: string | null }[]
}

interface PortableTextChild {
  _type?: string
  voice?: string

  [key: string]: unknown
}

interface PortableTextNode {
  _type?: string
  style?: string
  children?: PortableTextChild[]
  body?: PortableTextBlocks
  // Unlike the fields below, these are known, confirmed-from-schema plain
  // strings/booleans (infoBox.title/includeInSyntheticVoice, pullQuote.text/
  // source) — not portable text — so they get an actual type instead of
  // `unknown`.
  title?: string
  text?: string
  source?: string
  includeInSyntheticVoice?: boolean
  caption?: { legend?: PortableTextBlocks; credit?: PortableTextBlocks }

  [key: string]: unknown
}

const pause = (duration = 1.4) => ({
  type: 'pause',
  attrs: { pause: duration },
})

const jingle = { type: 'sound', attrs: { soundName: 'Republik: Jingle' } }
const stinger = { type: 'sound', attrs: { soundName: 'Republik: Stinger' } }

// Huebsch's chapter marker node: { type: 'marker', attrs: { label } }, label
// 1-256 chars. Purely additive — doesn't affect voice/pause/text handling.
const marker = (label: string) => ({
  type: 'marker',
  attrs: { label: label.slice(0, 256) },
})

const addFullStop = (text: string) =>
  /[….?!:;]$/.test(text) ? text : `${text}.`

// Most fields here are portable text arrays, but a few (pullQuote.text/
// source, infoBox.title) are plain strings — handle both.
export const plainText = (value: unknown): string => {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return toPlainText(value as any).trim()
  } catch {
    return ''
  }
}

const paragraph = (voice: string, text: string, role: string, meta = {}) => ({
  type: 'paragraph',
  attrs: {
    voiceName: voice,
    proofreadPromptName: 'Republik Sprechkorrektorat',
    meta: { ...meta, role },
  },
  content: [{ type: 'text', text: addFullStop(text) }],
})

// Keeps only text/translation contributors, matching the old behaviour of
// dropping photo/illustration credits from the audio notice. A missing or
// empty `kind` counts as a text author: `kind` is free text, and studio's
// own migration/merge logic treats "no role recorded" the same way.
const keepTextContributor = (c: { kind?: string }) =>
  !c.kind || /text|übersetzung/i.test(c.kind)

const authorsFromContributors = (
  contributors: SpeakableSource['contributors'],
): string[] =>
  (contributors ?? [])
    .filter(keepTextContributor)
    .map((c) => c.name)
    .filter((name): name is string => Boolean(name))

// Fallback for articles whose structured `contributors` isn't populated yet.
// Ported from the old republik/tts service's huebschFormatter.js: `byline` is
// a freeform string (e.g. "Ein Beitrag von Jane Doe (Text) und John Smith
// (Bild), 12.05.2023"), so the roles have to be parsed back out of it.
const getAuthors = (byline: string) => {
  const authorsRe = /^.*?[vV]on (.+?) [0-9]{2}.[0-9]{2}.20[0-9]{2}.*/
  const match = byline.match(authorsRe)
  if (!match) throw new Error('could not find an author list in byline')
  return match[1]
}

const splitAuthors = (text: string) =>
  text.split(/(?:, (?![^(]*\)))|(?: und (?![^(]*\)))/)

const getAuthorRole = (author: string) => {
  const roleRe = /(.*) \(([^()]*)\)/
  const authorRole = author.match(roleRe)
  if (!authorRole?.length || authorRole.length > 3) {
    return { name: author, role: 'text' }
  }
  return { name: authorRole[1], role: authorRole[2].toLowerCase() }
}

const keepTextAuthors = (author: { role: string }) =>
  /text|übersetzung/.test(author.role)

const makeCommaSeparatedString = (items: string[]) => {
  const listStart = items.slice(0, -1).join(', ')
  const listEnd = items.slice(-1)
  const conjunction = items.length <= 1 ? '' : ' und '
  return [listStart, listEnd].join(conjunction)
}

const getAuthorsList = (byline?: string) => {
  if (!byline) return []
  try {
    return splitAuthors(getAuthors(byline))
      .map(getAuthorRole)
      .filter(keepTextAuthors)
      .map((author) => author.name.replace(/,$/, ''))
  } catch {
    return []
  }
}

const bylineText = (authors: string[]): string => {
  if (!authors?.length) return TTS_NOTICE
  return `Ein Beitrag von ${makeCommaSeparatedString(
    authors,
  )}, vorgelesen von einer synthetischen Stimme.`
}

interface VoiceSegment {
  voice: string
  text: string
}

// A `voiceTag` is an inline child dropped into a block's `children` — not an
// annotation with an explicit range. By editorial convention it switches the
// voice for everything after it in that same block (used for interview-style
// dialogue), until the next voiceTag or the end of the block. It carries the
// concrete voice id directly, so unlike the old syntheticVoice/syntheticVoice2
// split, there's no second voice to look up — just split the block wherever a
// tag appears and give each resulting segment its tagged voice.
const splitBlockByVoiceTag = (
  block: PortableTextNode,
  defaultVoice: string,
): VoiceSegment[] => {
  const children = block.children ?? []
  const segments: VoiceSegment[] = []

  let currentVoice = defaultVoice
  let currentChildren: PortableTextChild[] = []

  const flush = () => {
    if (!currentChildren.length) return
    const text = plainText([{ ...block, children: currentChildren }])
    if (text) segments.push({ voice: currentVoice, text })
    currentChildren = []
  }

  for (const child of children) {
    if (child._type === 'voiceTag' && typeof child.voice === 'string') {
      flush()
      currentVoice = child.voice
      continue
    }
    currentChildren.push(child)
  }
  flush()

  return segments
}

type BodyItem =
  | { kind: 'divider' }
  | { kind: 'text'; role: string; isHeading: boolean; segments: VoiceSegment[] }

const textItem = (
  role: string,
  voice: string,
  text: string,
  isHeading = false,
): BodyItem => ({ kind: 'text', role, isHeading, segments: [{ voice, text }] })

// Brackets a group of items (a quote, an info box, ...) with virtual
// dividers, reusing the existing caesura pause logic so entering/leaving the
// aside gets the same heavier "beat" pause as a real divider — no separate
// pause-duration bookkeeping needed. No-ops for an empty group.
const withPauseBoundary = (items: BodyItem[]): BodyItem[] =>
  items.length ? [{ kind: 'divider' }, ...items, { kind: 'divider' }] : []

interface NodeTransformContext {
  voice: string
  defaultRole: string
  // Lets a transform recurse into a nested body (blockQuote/infoBox/webOnly)
  // through the same registry/dispatch, rather than calling itself directly.
  flatten: (nodes: unknown[], voice: string, defaultRole?: string) => BodyItem[]
}

type NodeTransform = (
  node: PortableTextNode,
  ctx: NodeTransformContext,
) => BodyItem[]

// One entry per content node type — see `nodeTransforms` below for the full
// index of what's handled and what's intentionally excluded. Adding support
// for a new node type is: write a transform here, add one line to the
// registry.

const blockTransform: NodeTransform = (node, ctx) => {
  const segments = splitBlockByVoiceTag(node, ctx.voice)
  if (!segments.length) return []

  // exclusively used for in-article image credits
  if (node.style === 'note') return []

  const isHeading = node.style === 'heading'
  // 'question' is Huebsch's documented role for interview questions (see
  // intake-republik docs, "example keys"); `interviewQuestion` is the style
  // `styleInterviewQuestions` (mdastToPortableText.ts) stamps on the block
  // preceding an interview answer.
  const role = isHeading
    ? 'subtitle'
    : node.style === 'interviewQuestion'
    ? 'question'
    : ctx.defaultRole
  return [
    {
      kind: 'text',
      role,
      isHeading,
      segments,
    },
  ]
}

const dividerTransform: NodeTransform = () => [{ kind: 'divider' }]

// Literally on-web content — read like any other body content, no framing.
const webOnlyTransform: NodeTransform = (node, ctx) =>
  ctx.flatten(node.body ?? [], ctx.voice, ctx.defaultRole)

const blockQuoteTransform: NodeTransform = (node, ctx) => {
  const nested = ctx.flatten(node.body ?? [], ctx.voice, 'quote')
  if (!nested.length) return []
  const attribution =
    plainText(node.caption?.legend) || plainText(node.caption?.credit)
  return withPauseBoundary([
    ...nested,
    ...(attribution
      ? [textItem('quote-attribution', ctx.voice, attribution)]
      : []),
  ])
}

const infoBoxTransform: NodeTransform = (node, ctx) => {
  // Infoboxen carry sidebar material that usually reads badly aloud, so
  // they're excluded from the Audioversion by default; an editor opts a
  // specific box back in via this field. Absent (every Infobox written
  // before the field existed) must also mean excluded, not just `false`.
  if (node.includeInSyntheticVoice !== true) return []
  const title = plainText(node.title)
  // 'aside' is Huebsch's documented role for sidebar-style content (see
  // intake-republik docs, "example keys") — using it (rather than a
  // repo-invented string) lets Huebsch's pipeline apply its own aside
  // handling. Only 'aside' itself is documented, so the title paragraph
  // gets the same role rather than an invented 'aside-title'.
  const nested = ctx.flatten(node.body ?? [], ctx.voice, 'aside')
  if (!title && !nested.length) return []
  return withPauseBoundary([
    ...(title ? [textItem('aside', ctx.voice, title)] : []),
    ...nested,
  ])
}

const pullQuoteTransform: NodeTransform = (node, ctx) => {
  const text = plainText(node.text)
  if (!text) return []
  const source = plainText(node.source)
  return withPauseBoundary([
    textItem('pullquote', ctx.voice, text),
    ...(source ? [textItem('pullquote-source', ctx.voice, source)] : []),
  ])
}

// Email-only content (confirmed by their own field descriptions) — never
// part of the web article this audio is read from. Registered explicitly
// (rather than left unregistered like a truly unhandled type) so the
// exclusion reads as an intentional decision, not a gap.
const excludeTransform: NodeTransform = () => []

const nodeTransforms: Record<string, NodeTransform> = {
  block: blockTransform,
  divider: dividerTransform,
  webOnly: webOnlyTransform,
  blockQuote: blockQuoteTransform,
  infoBox: infoBoxTransform,
  pullQuote: pullQuoteTransform,
  emailOnly: excludeTransform,
  if: excludeTransform,
  ifNot: excludeTransform,
  // No narratable editorial prose (images, embeds, chart, html,
  // dynamicComponent, storyComponent, seriesNav, button, ...) — anything not
  // registered here is simply skipped by the dispatch loop below.
}

// Recursively flattens a portable text array (top-level `content`, or a
// nested `body` inside blockQuote/infoBox/webOnly) into a flat BodyItem list.
// `defaultRole` tags plain paragraphs within a nested body (e.g. 'quote'
// inside a blockQuote) — headings always get 'subtitle' regardless.
const flattenToBodyItems = (
  nodes: unknown[],
  voice: string,
  defaultRole = 'paragraph',
): BodyItem[] => {
  const ctx: NodeTransformContext = {
    voice,
    defaultRole,
    flatten: flattenToBodyItems,
  }
  const items: BodyItem[] = []

  for (const raw of nodes) {
    if (!raw || typeof raw !== 'object') continue
    const node = raw as PortableTextNode
    const transform = node._type ? nodeTransforms[node._type] : undefined
    if (transform) items.push(...transform(node, ctx))
  }

  return items
}

export interface BuildSpeakableContentOptions {
  chapterMarkers?: boolean
}

export const buildSpeakableContent = (
  source: SpeakableSource,
  voice: string,
  options?: BuildSpeakableContentOptions,
) => {
  const blocks: unknown[] = [jingle]

  // as per Republik rulebook: lead is spoken before title
  const lead = plainText(source.description)
  if (lead) {
    blocks.push(paragraph(voice, lead, 'lead'), pause(1.4))
  }

  const title = plainText(source.title)
  if (title) {
    blocks.push(paragraph(voice, title, 'title'), pause(1.4))
  }

  // Structured credits win when they name anyone at all; the byline parse
  // stays as the fallback until `contributors` is populated everywhere.
  const contributorAuthors = authorsFromContributors(source.contributors)
  const authors = contributorAuthors.length
    ? contributorAuthors
    : getAuthorsList(plainText(source.byline))
  blocks.push(
    paragraph(voice, bylineText(authors), 'credits', { authors }),
    pause(1.4),
  )

  const bodyItems = flattenToBodyItems(source.content ?? [], voice)

  if (!bodyItems.some((item) => item.kind === 'text')) {
    throw new SpeakableContentError('no speakable text found in content')
  }

  let lastTextItem: Extract<BodyItem, { kind: 'text' }> | undefined
  let pendingDivider = false

  for (const item of bodyItems) {
    if (item.kind === 'divider') {
      pendingDivider = true
      continue
    }

    if (
      lastTextItem &&
      (pendingDivider || lastTextItem.isHeading || item.isHeading)
    ) {
      // a divider, or either side being a heading (or an aside boundary,
      // itself expressed as a virtual divider), gets the "beat" pause;
      // plain paragraph-to-paragraph transitions get none.
      blocks.push(pause(1.4))
    }

    if (options?.chapterMarkers && item.isHeading) {
      blocks.push(marker(item.segments[0].text))
    }

    item.segments.forEach((segment) => {
      blocks.push(paragraph(segment.voice, segment.text, item.role))
    })

    lastTextItem = item
    pendingDivider = false
  }

  blocks.push(stinger)
  return blocks
}

export const plainTitle = (title: unknown) => plainText(title) || 'Ohne Titel'
