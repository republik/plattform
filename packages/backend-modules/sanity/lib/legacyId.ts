import { v5 as uuidV5 } from 'uuid'

// Mirrors studio's import/publikator/src/generateUUID.ts exactly (same
// namespace string, same DNS-based derivation, same github-path
// normalization) — the one-time import minted each migrated article/format's
// Sanity `_id` deterministically from its repoId, so the mapping is
// something we compute, not something we need to query a stored field for.
const NAMESPACE = uuidV5('ch.republik.publikator', uuidV5.DNS)
const PAGE_NAMESPACE = uuidV5('ch.republik.publikator.page', uuidV5.DNS)
const NEWSLETTER_NAMESPACE = uuidV5(
  'ch.republik.publikator.newsletter',
  uuidV5.DNS,
)
const PODCAST_NAMESPACE = uuidV5('ch.republik.publikator.podcast', uuidV5.DNS)

export const normalizeGithubPath = (input: string): string => {
  let sanitized = input.trim()
  if (!sanitized.includes('://')) {
    sanitized = sanitized.includes('github.com')
      ? `https://${sanitized}`
      : `https://github.com/${sanitized}`
  }

  const url = new URL(sanitized)

  // .pathname gives us "/owner/repo/maybe/more" — only the first two
  // segments matter.
  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length >= 2) {
    return `${segments[0]}/${segments[1]}`.toLowerCase()
  }
  throw new Error('Invalid input')
}

// Matches generateUUID.ts#repoIDToSanityUUID — the namespace used for plain
// articles AND Format/Dossier repos (confirmed via transform.ts: a Format's
// migrated articleCollection counterpart uses this same derivation, only its
// separately-migrated "page" companion doc uses a different namespace).
export const repoIdToSanityId = (repoId: string): string =>
  uuidV5(normalizeGithubPath(repoId), NAMESPACE)

// Matches generateUUID.ts#repoIDToPageUUID — the id of a format/section's
// migrated `page` companion document, i.e. the target of an article's
// `heading` reference ("Spitzmarke" in the Studio schema).
export const repoIdToPageId = (repoId: string): string =>
  uuidV5(normalizeGithubPath(repoId), PAGE_NAMESPACE)

// Matches generateUUID.ts#repoIDToNewsletterUUID / #repoIDToPodcastUUID — the
// id of a format's migrated `newsletter`/`podcast` document, targeted by an
// article's own `newsletter`/`podcast` reference when its format has one.
export const repoIdToNewsletterId = (repoId: string): string =>
  uuidV5(normalizeGithubPath(repoId), NEWSLETTER_NAMESPACE)

export const repoIdToPodcastId = (repoId: string): string =>
  uuidV5(normalizeGithubPath(repoId), PODCAST_NAMESPACE)

// Matches transform.ts#isGithubRepublikUrl: accepts a full GitHub URL
// (`github.com/republik/...`) or the bare `republik/<repo>` shorthand some
// meta fields (format, section, series) use.
export const isGithubRepublikUrl = (value: unknown): value is string =>
  typeof value === 'string' &&
  (value.includes('github.com/republik/') || /^republik\//.test(value))

// A meta field that points at another repo (meta.format, meta.section, ...),
// normalized to a bare repoId — undefined for anything foreign/malformed
// rather than feeding normalizeGithubPath a value it would throw on.
export const resolveRepublikRepoId = (value: unknown): string | undefined => {
  if (!isGithubRepublikUrl(value)) return undefined
  try {
    return normalizeGithubPath(value)
  } catch {
    return undefined
  }
}
