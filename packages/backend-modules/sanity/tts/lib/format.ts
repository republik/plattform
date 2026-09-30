// The format identifier Huebsch receives as `meta.format`.
//
// The legacy republik/tts service sent `content.meta.format` verbatim — the
// Publikator format's own repo id, e.g. "republik/format-briefing-aus-bern".
// Those repo names were produced by the styleguide's `slug()`
// (packages/styleguide/src/lib/slug.ts, via
// apps/publikator/components/Repo/Add.js), so that exact algorithm is
// ported here rather than the looser slugify in
// @orbiting/backend-modules-utils — the two disagree on umlauts and
// therefore on which repo id an article claims to belong to.

const diacriticsMap: Record<string, string> = {
  â: 'a',
  à: 'a',
  ç: 'c',
  é: 'e',
  ê: 'e',
  è: 'e',
  ë: 'e',
  î: 'i',
  ï: 'i',
  ô: 'o',
  ù: 'u',
  û: 'u',
  ß: 'ss',
  ä: 'ae',
  ü: 'ue',
  ö: 'oe',
}

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      // eslint-disable-next-line no-control-regex
      .replace(/[^\u0000-~]/g, (a) => diacriticsMap[a] || a)
      .replace(/­/g, '')
      .replace(/[^0-9a-z]+/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
  )
}

const DEFAULT_FORMAT = 'article'
const DEFAULT_REPO_PREFIX = 'republik'

// Overridable so the identifier can be sent as a full, clickable GitHub URL
// (TTS_FORMAT_REPO_PREFIX=https://github.com/republik) for manual
// verification against the real format repo while Huebsch's team is
// unreachable to confirm the shape they actually expect — without changing
// the default (bare "republik/format-<slug>", what the legacy republik/tts
// service always sent) for everyone else. Read lazily, not cached at module
// load, so it can be set per-process without a restart-sensitive import order.
const repoPrefix = (): string =>
  process.env.TTS_FORMAT_REPO_PREFIX || DEFAULT_REPO_PREFIX

// Slugifies the article's Spitzmarke title into the same format-* shape the
// legacy republik/tts service sent as content.meta.format. Always derived
// from the Spitzmarke (not a stored repoId) since every format created
// directly in Studio going forward has no repoId at all — only content
// migrated from the old Publikator import ever gets one.
export function resolveFormatId(spitzmarkeTitle?: string | null): string {
  const slug = spitzmarkeTitle ? slugify(spitzmarkeTitle) : ''
  const prefix = repoPrefix()
  return slug ? `${prefix}/format-${slug}` : `${prefix}/${DEFAULT_FORMAT}`
}
