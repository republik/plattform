// See textToSpeech.u.jest.ts for this suite's testing policy.
//
// Covers describeHuebschError's formatting in isolation (pure function, no
// mocking needed), plus uploadToHuebsch/parseHuebschResult's HTTP behavior with
// `fetch` stubbed — real network calls have no place in a unit test suite.
// fetchWithRetry's retry-with-delay loop isn't separately exercised here
// (it'd need fake-timer choreography that outweighs the value versus just
// testing its two error branches and one success path); that's a known,
// intentional gap, not a silent one.

import {
  HuebschError,
  assertSafeAssetUrl,
  describeHuebschError,
  parseHuebschResult,
  uploadToHuebsch,
} from '../huebsch'

beforeAll(() => {
  process.env.HUEBSCH_API_URL = 'https://huebsch.example.com'
  process.env.HUEBSCH_API_KEY = 'test-key'
})

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
})

describe('describeHuebschError', () => {
  it('formats code + error + message + issues into a readable string', () => {
    const result = describeHuebschError({
      error: 'Schema validation failed',
      code: '422.2',
      message: 'Invalid field value',
      issues: [{ path: ['title'], message: 'Required' }],
    })
    expect(result).toBe(
      '[422.2] Schema validation failed: Invalid field value (title: Required)',
    )
  })

  it('omits the message when it duplicates the error text', () => {
    const result = describeHuebschError({
      error: 'voice "Unknown" not found',
      code: '422.x',
      message: 'voice "Unknown" not found',
    })
    expect(result).toBe('[422.x] voice "Unknown" not found')
  })

  it('formats an error with no code and no issues', () => {
    expect(describeHuebschError({ error: 'Not found' })).toBe('Not found')
  })

  it('falls back to JSON.stringify for a shape with neither error nor code', () => {
    expect(describeHuebschError({ somethingElse: true })).toBe(
      '{"somethingElse":true}',
    )
  })
})

describe('uploadToHuebsch / parseHuebschResult (fetch stubbed)', () => {
  it('uploadToHuebsch sends the format identifier as attrs.meta.format', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true, val: 'accepted' }), {
          status: 200,
        }),
      )
    global.fetch = fetchMock as unknown as typeof fetch

    await uploadToHuebsch(
      [{ type: 'sound' }],
      'doc-1',
      '/slug',
      'Title',
      'https://x/webhook',
      { format: 'republik/format-briefing-aus-bern' },
    )

    const [, requestInit] = fetchMock.mock.calls[0]
    const body = JSON.parse(requestInit.body as string)
    expect(body.content[0].attrs.meta).toEqual({
      format: 'republik/format-briefing-aus-bern',
    })
  })

  it('uploadToHuebsch falls back to republik/article when no format is given', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true, val: 'accepted' }), {
          status: 200,
        }),
      )
    global.fetch = fetchMock as unknown as typeof fetch

    await uploadToHuebsch(
      [{ type: 'sound' }],
      'doc-1',
      '/slug',
      'Title',
      'https://x/webhook',
    )

    const [, requestInit] = fetchMock.mock.calls[0]
    const body = JSON.parse(requestInit.body as string)
    expect(body.content[0].attrs.meta.format).toBe('republik/article')
  })

  it('uploadToHuebsch sends description/source in article attrs and resolves on success', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true, val: 'accepted' }), {
          status: 200,
        }),
      )
    global.fetch = fetchMock as unknown as typeof fetch

    await uploadToHuebsch(
      [{ type: 'sound' }],
      'doc-1',
      '/slug',
      'Title',
      'https://x/webhook',
      { description: 'A lead.', source: 'https://www.republik.ch/slug' },
    )

    const [, requestInit] = fetchMock.mock.calls[0]
    const body = JSON.parse(requestInit.body as string)
    expect(body.content[0].attrs.slug).toBe('/slug')
    expect(body.content[0].attrs.description).toBe('A lead.')
    expect(body.content[0].attrs.source).toBe('https://www.republik.ch/slug')
  })

  it('omits attrs.slug entirely when there is no slug yet, rather than sending a placeholder', async () => {
    // A draft with no slug (e.g. an automatic-slug article, deliberately
    // left empty until it's actually published) has nothing valid to offer
    // here — Huebsch validates slug's format when present ("alphanumeric,
    // hyphens and slashes, beginning with a slash"), so sending an empty or
    // synthesized value would just trade one failure mode for another.
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true, val: 'accepted' }), {
          status: 200,
        }),
      )
    global.fetch = fetchMock as unknown as typeof fetch

    await uploadToHuebsch(
      [{ type: 'sound' }],
      'drafts.doc-1',
      undefined,
      'Title',
      'https://x/webhook',
    )

    const [, requestInit] = fetchMock.mock.calls[0]
    const body = JSON.parse(requestInit.body as string)
    expect('slug' in body.content[0].attrs).toBe(false)
  })

  it('uploadToHuebsch throws a HuebschError with the parsed message on a Result-pattern error', async () => {
    // a fresh Response per call — a Response body can only be read once, so
    // reusing one instance across two assertions would make the second call
    // see an already-consumed body and mask what's actually being tested.
    global.fetch = jest.fn().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            ok: false,
            val: { error: 'Schema validation failed', code: '422.2' },
          }),
          { status: 422 },
        ),
    ) as unknown as typeof fetch

    const call = () =>
      uploadToHuebsch([], 'doc-1', '/slug', 'Title', 'https://x/webhook')

    await expect(call()).rejects.toThrow(HuebschError)
    await expect(call()).rejects.toThrow(/\[422\.2\] Schema validation failed/)
  })

  it('parseHuebschResult throws with the parsed error when the webhook reports a failed generation', async () => {
    await expect(
      parseHuebschResult({
        ok: false,
        val: { error: 'voice "Unknown" not found', code: '422.x' },
      }),
    ).rejects.toThrow(/voice "Unknown" not found/)
  })

  it('parseHuebschResult throws a generic message when there is no asset url at all', async () => {
    await expect(parseHuebschResult({ ok: true, val: {} })).rejects.toThrow(
      /no asset url|had no asset url/,
    )
  })

  it('parseHuebschResult downloads the asset and surfaces chapters when present', async () => {
    const audioBytes = new Uint8Array([1, 2, 3]).buffer
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(audioBytes),
    }) as unknown as typeof fetch

    const result = await parseHuebschResult({
      ok: true,
      val: {
        asset: 'https://cdn.example.com/audio.mp3',
        chapters: [{ name: 'Intro', at: 0 }],
      },
    })

    expect(result.audioFile).toBe(audioBytes)
    expect(result.chapters).toEqual([{ name: 'Intro', at: 0 }])
  })

  it("parseHuebschResult converts Huebsch's duration (seconds) to rounded milliseconds", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    }) as unknown as typeof fetch

    const result = await parseHuebschResult({
      ok: true,
      val: { asset: 'https://cdn.example.com/audio.mp3', duration: 245.5 },
    })

    expect(result.durationMs).toBe(245500)
  })

  it('parseHuebschResult leaves durationMs undefined when Huebsch reports no duration', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    }) as unknown as typeof fetch

    const result = await parseHuebschResult({
      ok: true,
      val: { asset: 'https://cdn.example.com/audio.mp3' },
    })

    expect(result.durationMs).toBeUndefined()
  })
})

describe('assertSafeAssetUrl / parseHuebschResult SSRF guard', () => {
  afterEach(() => {
    delete process.env.HUEBSCH_ASSET_HOSTS
  })

  it.each([
    'http://cdn.example.com/a.mp3',
    'file:///etc/passwd',
    'not a url',
    'https://user:pw@cdn.example.com/a.mp3',
    'https://localhost/a.mp3',
    'https://foo.localhost/a.mp3',
    'https://intranet/a.mp3',
    'https://metadata.google.internal/a',
    'https://127.0.0.1/a',
    'https://127.1/a',
    'https://2130706433/a',
    'https://0x7f.0.0.1/a',
    'https://10.1.2.3/a',
    'https://172.16.0.1/a',
    'https://192.168.1.1/a',
    'https://169.254.169.254/latest/meta-data',
    'https://100.64.0.1/a',
    'https://0.0.0.0/a',
    'https://[::1]/a',
    'https://[::ffff:127.0.0.1]/a',
    'https://[::ffff:a9fe:a9fe]/a',
    'https://[fe80::1]/a',
    'https://[fd00::1]/a',
  ])('rejects %s', (url) => {
    expect(() => assertSafeAssetUrl(url)).toThrow(HuebschError)
  })

  it('accepts public https urls', () => {
    expect(() =>
      assertSafeAssetUrl('https://cdn.example.com/audio.mp3'),
    ).not.toThrow()
    expect(() => assertSafeAssetUrl('https://8.8.8.8/audio.mp3')).not.toThrow()
  })

  it('enforces HUEBSCH_ASSET_HOSTS when set (exact or subdomain)', () => {
    process.env.HUEBSCH_ASSET_HOSTS = 'huebsch.example.com, assets.test'
    expect(() =>
      assertSafeAssetUrl('https://huebsch.example.com/a.mp3'),
    ).not.toThrow()
    expect(() =>
      assertSafeAssetUrl('https://x.assets.test/a.mp3'),
    ).not.toThrow()
    expect(() => assertSafeAssetUrl('https://evil.example.org/a.mp3')).toThrow(
      /allowlist/,
    )
    expect(() => assertSafeAssetUrl('https://notassets.test/a.mp3')).toThrow(
      /allowlist/,
    )
  })

  it('parseHuebschResult does not fetch an unsafe asset url', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch

    await expect(
      parseHuebschResult({
        ok: true,
        val: { asset: 'https://169.254.169.254/latest/meta-data' },
      }),
    ).rejects.toThrow(HuebschError)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
