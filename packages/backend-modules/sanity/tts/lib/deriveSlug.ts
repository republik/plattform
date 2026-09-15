// Adapted from studio's shared/slug/deriveSlug.ts: same overall algorithm
// (title, optionally combined with the Spitzmarke/heading segment per its
// template, date-prefixed and slugified), but without that file's two
// dependencies:
//
// - @sindresorhus/slugify is ESM-only. This package compiles to CommonJS
//   (see tsconfig.json — no "type": "module" here), so a static import of
//   it would not resolve at runtime. slugifySlugSource below is a small,
//   dependency-free replacement (NFKD + combining-mark strip for
//   diacritics, then lowercase/hyphenate) — not guaranteed byte-identical
//   with studio's own output for every possible input, but the same shape.
// - date-fns + @date-fns/tz, for a Zurich-local date — replaced with
//   Node's built-in Intl.DateTimeFormat, which needs no new dependency.
//
// Byte-identical output isn't the goal here anyway: this is only ever a
// *preview* slug, used when an automatic-slug article's real slug is
// deliberately still empty (not yet published — see studio's own
// sharedFields.ts comment) and something valid is needed regardless (e.g.
// Huebsch's required attrs.slug). Sanity's own slug-freeze-publish Function
// re-derives and corrects the real slug from scratch at actual publish
// time, using its own exact logic — so this only has to be a reasonable,
// valid, same-shape approximation, not the final word.

export interface HeadingSlugConfig {
  segment?: string | null
  template?: string | null
}

// Matches the schema's page.slugTemplate options.list values exactly (see
// studio's workspaces/newsroom/schema/page/document.tsx) — mirrored as
// literals rather than shared, since this package has no import path into
// that repo.
export const HEADING_TEMPLATE_SEGMENT_THEN_TITLE = '{{segment}}-{{title}}'
export const HEADING_TEMPLATE_TITLE_THEN_SEGMENT = '{{title}}-{{segment}}'
export const HEADING_TEMPLATE_SEGMENT_ONLY = '{{segment}}'

function combineHeadingSegment(
  segment: string,
  title: string,
  template: string | null | undefined,
): string {
  if (template === HEADING_TEMPLATE_SEGMENT_ONLY) return segment
  if (template === HEADING_TEMPLATE_TITLE_THEN_SEGMENT) {
    return title ? `${title}-${segment}` : segment
  }
  return title ? `${segment}-${title}` : segment
}

function resolveDateBasis(
  publishDate: string | null | undefined,
  now: Date,
): Date {
  if (!publishDate) return now
  const parsed = new Date(publishDate)
  return Number.isNaN(parsed.getTime()) ? now : parsed
}

// Europe/Zurich-local "/yyyy/MM/dd" (leading slash included, matching
// studio's own date-fns format string) — 'en-CA' conveniently formats as
// yyyy-MM-dd.
function zurichDatePath(date: Date): string {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  return `/${formatted.replace(/-/g, '/')}`
}

// @sindresorhus/slugify (which studio uses) transliterates German umlauts
// the German way — ü/ö/ä -> ue/oe/ae, ß -> ss — not the generic
// diacritic-stripping NFKD would give (ü -> u). Republik is an all-German
// publication, so this is the common case, not an edge case: matching it
// explicitly, then falling back to NFKD + combining-mark removal for any
// other accented Latin character this ever sees.
const GERMAN_TRANSLITERATIONS: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
  Ä: 'Ae',
  Ö: 'Oe',
  Ü: 'Ue',
}

// Lowercase, German umlauts transliterated (see above), remaining
// diacritics stripped (NFKD decomposition + combining-mark removal),
// non-alphanumeric runs collapsed to one hyphen, "/" preserved as a path
// separator, no leading/trailing hyphen per segment.
export function slugifySlugSource(input: string): string {
  return input
    .split('/')
    .map((segment) =>
      segment
        .replace(/[äöüßÄÖÜ]/g, (ch) => GERMAN_TRANSLITERATIONS[ch] ?? ch)
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    )
    .join('/')
}

// titleText is already-extracted plain text (this package's own
// plainText/plainTitle helpers handle the Portable Text -> string step —
// no need for a second implementation of that here).
export function buildSlugSource(
  titleText: string,
  publishDate: string | null | undefined,
  now: Date,
  heading?: HeadingSlugConfig | null,
): string | null {
  const headingSegment = heading?.segment?.trim()
  const segment = headingSegment
    ? combineHeadingSegment(headingSegment, titleText, heading?.template)
    : titleText
  if (!segment) return null

  return `${zurichDatePath(resolveDateBasis(publishDate, now))}/${segment}`
}

export function deriveSlug(
  titleText: string,
  publishDate: string | null | undefined,
  now: Date,
  heading?: HeadingSlugConfig | null,
): string | null {
  const source = buildSlugSource(titleText, publishDate, now, heading)
  if (!source) return null

  const slug = slugifySlugSource(source)
  const datePart = zurichDatePath(resolveDateBasis(publishDate, now))

  // A title (and heading segment, if any) of only separators/punctuation
  // slugifies away, leaving the bare date path — not a usable slug.
  return slug === datePart || slug === `${datePart}/` ? null : slug
}
