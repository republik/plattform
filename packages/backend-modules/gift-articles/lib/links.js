const crypto = require('crypto')

const GIFT_LINK_TTL_DAYS = 14

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
    // Base64 of the DER-encoded PKCS#8 key: one line, no PEM header.
    privateKey = crypto.createPrivateKey({
      key: Buffer.from(GIFT_LINK_PRIVATE_KEY.trim(), 'base64'),
      format: 'der',
      type: 'pkcs8',
    })
  }
  return privateKey
}

// www checks it with the public key (GIFT_LINK_PUBLIC_KEY), see
// apps/www/src/app/api/gift-token/verify.ts.
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

const createGiftToken = ({ documentId, now = new Date() }) =>
  signGiftToken({ documentId, expiresAt: giftLinkExpiry(now) })

module.exports = {
  createGiftToken,
}
