const crypto = require('crypto')
const {
  isSanityRef,
  fromSanityRef,
  publishedId,
} = require('@orbiting/backend-modules-sanity')

const { FRONTEND_BASE_URL } = process.env

const GIFT_LINK_TTL_DAYS = 14

// Normalises a client-supplied reference to the published Sanity `_id`.
// Accepts the `sanity:`-prefixed ref `collectionsDocumentId()` builds and the
// `drafts.`-prefixed id a preview reader sends, so a granter reading the draft
// and one reading the published version sign the same article.
const toStoredDocumentId = (input) =>
  publishedId(isSanityRef(input) ? fromSanityRef(input) : input)

// A link runs until the end of the UTC day 14 days from now, so it lives at
// least 14 and under 15 days. Rounding makes the payload, and with it the
// Ed25519 signature, the same for every share of an article on the same day:
// sharing again hands out the same link without anything being stored.
const giftLinkExpiry = (now = new Date()) => {
  const ttlEnd = new Date(now.getTime() + GIFT_LINK_TTL_DAYS * 864e5)
  return new Date(
    Date.UTC(
      ttlEnd.getUTCFullYear(),
      ttlEnd.getUTCMonth(),
      ttlEnd.getUTCDate() + 1,
    ),
  )
}

let privateKey
const getPrivateKey = () => {
  if (!privateKey) {
    const { GIFT_LINK_PRIVATE_KEY } = process.env
    if (!GIFT_LINK_PRIVATE_KEY) {
      throw new Error('GIFT_LINK_PRIVATE_KEY is not set')
    }
    // Env files and some dashboards keep a PEM on one line with literal "\n".
    privateKey = crypto.createPrivateKey(
      GIFT_LINK_PRIVATE_KEY.replace(/\\n/g, '\n'),
    )
  }
  return privateKey
}

// Token: `base64url(payload).base64url(signature)`. The payload names the
// article (`d`, published Sanity `_id`) and the expiry (`e`, unix seconds);
// the Ed25519 signature covers the payload exactly as it appears in the URL.
// www checks it with the public key (GIFT_LINK_PUBLIC_KEY), see
// apps/www/src/app/(sanity)/components/paynotes/verify-gift-token.ts.
const signGiftToken = ({ documentId, expiresAt }) => {
  const payload = Buffer.from(
    JSON.stringify({
      d: documentId,
      e: Math.floor(expiresAt.getTime() / 1000),
    }),
  ).toString('base64url')
  const signature = crypto
    .sign(null, Buffer.from(payload), getPrivateKey())
    .toString('base64url')
  return `${payload}.${signature}`
}

const createGiftLink = ({ documentId, documentPath, now = new Date() }) => {
  const token = signGiftToken({ documentId, expiresAt: giftLinkExpiry(now) })
  return `${FRONTEND_BASE_URL}${documentPath}?gift=${token}`
}

module.exports = {
  toStoredDocumentId,
  createGiftLink,
}
