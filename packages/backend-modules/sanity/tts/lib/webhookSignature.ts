import crypto from 'crypto'

// Signs the Huebsch callback URL per-document (and per-titleSlug — see below)
// with an expiry, instead of reusing one static secret for every callback
// forever. If a URL leaks (logs, referrers, Huebsch's own request logs), only
// that one document's callback window is exposed — not a master secret
// usable indefinitely.
//
// titleSlug and contentHash are folded into the signed payload (not just
// tacked on as query params) so neither can be tampered with in transit.
// titleSlug ends up as the Sanity asset's filename; contentHash ends up
// persisted as audioContentHash once generation succeeds — an attacker
// swapping either for something unexpected would otherwise go unnoticed
// since neither is separately validated against the document at webhook time.

const secret = () => {
  const value = process.env.WEBHOOK_SIGNING_SECRET
  if (!value) throw new Error('WEBHOOK_SIGNING_SECRET is not set')
  return value
}

const sign = (
  documentId: string,
  expiresAt: number,
  titleSlug: string,
  contentHash: string,
) =>
  crypto
    .createHmac('sha256', secret())
    .update(`${documentId}.${expiresAt}.${titleSlug}.${contentHash}`)
    .digest('hex')

// Huebsch retries a failed webhook delivery up to 20 times over ~24h from its
// first attempt — which itself can start well after this URL was minted (audio
// generation takes time). 24h from request-time would risk a legitimate late
// retry landing after our own expiry, so this is well beyond that worst case.
export const buildSignedWebhookPath = (
  documentId: string,
  titleSlug: string,
  contentHash: string,
  ttlMs = 72 * 60 * 60 * 1000,
) => {
  const expiresAt = Date.now() + ttlMs
  const signature = sign(documentId, expiresAt, titleSlug, contentHash)
  const query = new URLSearchParams({
    expires: String(expiresAt),
    titleSlug,
    contentHash,
    signature,
  })
  return `/webhooks/huebsch/${encodeURIComponent(documentId)}?${query}`
}

export const verifyWebhookSignature = (
  documentId: string,
  expiresAtRaw: string,
  titleSlug: string,
  contentHash: string,
  signature: string,
) => {
  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false
  }

  const expected = Buffer.from(
    sign(documentId, expiresAt, titleSlug, contentHash),
  )
  const actual = Buffer.from(signature)

  return (
    expected.length === actual.length &&
    crypto.timingSafeEqual(expected, actual)
  )
}
