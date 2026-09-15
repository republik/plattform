import { createHash } from 'crypto'

// Mirrors the identical algorithm in the studio repo's
// functions/sync-audio/index.ts (hashAudioContent/stableStringify) — same
// field selection, same sorted-key stringification, same sha256/hex
// encoding — so a hash written by either side can be compared by the other
// without drifting apart.
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).sort()
    return `{${keys
      .map(
        (k) =>
          `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`,
      )
      .join(',')}}`
  }
  return JSON.stringify(value)
}

export interface SpeakableFields {
  title?: unknown
  description?: unknown
  byline?: unknown
  content?: unknown
  syntheticVoice?: string
}

// Only the fields buildSpeakableContent actually turns into speech — a voice
// change counts too, since it changes the produced audio even for identical
// text. This is the article's content fingerprint *at the moment generation
// was requested*; it travels through the signed webhook URL and is only
// persisted to audioContentHash once generation is confirmed successful —
// never optimistically, since a request that never completes must not be
// mistaken for one that did.
export function hashSpeakableContent(fields: SpeakableFields): string {
  return createHash('sha256')
    .update(
      stableStringify({
        title: fields.title,
        description: fields.description,
        byline: fields.byline,
        content: fields.content,
        syntheticVoice: fields.syntheticVoice,
      }),
    )
    .digest('hex')
}
