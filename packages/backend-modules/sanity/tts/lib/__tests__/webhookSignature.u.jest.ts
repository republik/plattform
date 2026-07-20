// See textToSpeech.u.jest.ts for this suite's testing policy (don't weaken
// tests to force a pass — fix the source, or get a human to sign off on
// changing the test itself).
//
// These cover the HMAC signing/verification for the Huebsch callback URL:
// a tampered documentId, titleSlug, contentHash, or signature must all be
// rejected, and an expired signature must be rejected even if otherwise
// perfectly valid.

import {
  buildSignedWebhookPath,
  verifyWebhookSignature,
} from '../webhookSignature'

beforeAll(() => {
  process.env.HUEBSCH_WEBHOOK_SIGNING_SECRET = 'test-secret'
})

const parseSignedPath = (path: string) => {
  const url = new URL('http://x' + path)
  return {
    documentId: decodeURIComponent(url.pathname.split('/').pop()!),
    expires: url.searchParams.get('expires')!,
    titleSlug: url.searchParams.get('titleSlug')!,
    contentHash: url.searchParams.get('contentHash')!,
    signature: url.searchParams.get('signature')!,
  }
}

describe('buildSignedWebhookPath / verifyWebhookSignature', () => {
  it('produces a signature that verifies successfully untouched', () => {
    const { documentId, expires, titleSlug, contentHash, signature } =
      parseSignedPath(
        buildSignedWebhookPath('drafts.article-123', 'my-title-slug', 'abc123hash'),
      )
    expect(
      verifyWebhookSignature(documentId, expires, titleSlug, contentHash, signature),
    ).toBe(true)
  })

  it('rejects a tampered documentId', () => {
    const { expires, titleSlug, contentHash, signature } = parseSignedPath(
      buildSignedWebhookPath('drafts.article-123', 'my-title-slug', 'abc123hash'),
    )
    expect(
      verifyWebhookSignature('drafts.article-999', expires, titleSlug, contentHash, signature),
    ).toBe(false)
  })

  it('rejects a tampered titleSlug', () => {
    const { documentId, expires, contentHash, signature } = parseSignedPath(
      buildSignedWebhookPath('drafts.article-123', 'my-title-slug', 'abc123hash'),
    )
    expect(
      verifyWebhookSignature(documentId, expires, 'something-else', contentHash, signature),
    ).toBe(false)
  })

  it('rejects a tampered contentHash', () => {
    const { documentId, expires, titleSlug, signature } = parseSignedPath(
      buildSignedWebhookPath('drafts.article-123', 'my-title-slug', 'abc123hash'),
    )
    expect(
      verifyWebhookSignature(documentId, expires, titleSlug, 'something-else', signature),
    ).toBe(false)
  })

  it('rejects a tampered signature', () => {
    const { documentId, expires, titleSlug, contentHash, signature } =
      parseSignedPath(
        buildSignedWebhookPath('drafts.article-123', 'my-title-slug', 'abc123hash'),
      )
    const tampered = signature.startsWith('a')
      ? `b${signature.slice(1)}`
      : `a${signature.slice(1)}`
    expect(
      verifyWebhookSignature(documentId, expires, titleSlug, contentHash, tampered),
    ).toBe(false)
  })

  it('rejects an expired signature even though it is otherwise valid', () => {
    // negative TTL mints an already-expired, but correctly-signed, URL
    const { documentId, expires, titleSlug, contentHash, signature } =
      parseSignedPath(
        buildSignedWebhookPath(
          'drafts.article-123',
          'my-title-slug',
          'abc123hash',
          -1000,
        ),
      )
    expect(
      verifyWebhookSignature(documentId, expires, titleSlug, contentHash, signature),
    ).toBe(false)
  })

  it('defaults to a ~72h TTL', () => {
    const { expires } = parseSignedPath(
      buildSignedWebhookPath('drafts.article-123', 'my-title-slug', 'abc123hash'),
    )
    const hoursOut = (Number(expires) - Date.now()) / (60 * 60 * 1000)
    expect(hoursOut).toBeGreaterThan(71.9)
    expect(hoursOut).toBeLessThanOrEqual(72)
  })
})
