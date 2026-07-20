// Derives a human-readable, filename-safe label for uploaded audio assets
// (shown as the Sanity asset's filename/title, e.g. in the media browser)
// instead of the opaque documentId. The article's own `slug` is already
// "/yyyy/MM/dd/title-slug" (see studio's article/document.ts slug field), so
// its last segment is a ready-made slugified title — no separate slugify
// dependency needed here.
export const titleSlugFrom = (
  slug: string | undefined,
  fallback: string,
): string => {
  const segments = (slug ?? '').split('/').filter(Boolean)
  return sanitize(segments[segments.length - 1] || fallback)
}

const sanitize = (value: string): string => {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'audio'
}

// "2026-07-16T10:35:59.123Z" -> "20260716-103559"
export const compactTimestamp = (iso: string): string => {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`
  )
}
