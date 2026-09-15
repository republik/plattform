import { v5 as uuidV5 } from 'uuid'

// Mirrors studio's import/publikator/src/generateUUID.ts exactly (same
// namespace string, same DNS-based derivation, same github-path
// normalization) — the one-time import minted each migrated article/format's
// Sanity `_id` deterministically from its repoId, so the mapping is
// something we compute, not something we need to query a stored field for.
const NAMESPACE = uuidV5('ch.republik.publikator', uuidV5.DNS)

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
