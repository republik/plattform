// See textToSpeech.u.jest.ts for this suite's testing policy.
//
// Covers describeHuebschError's formatting in isolation (pure function, no
// mocking needed), plus uploadToHuebsch/getFromHuebsch's HTTP behavior with
// `fetch` stubbed — real network calls have no place in a unit test suite.
// fetchWithRetry's retry-with-delay loop isn't separately exercised here
// (it'd need fake-timer choreography that outweighs the value versus just
// testing its two error branches and one success path); that's a known,
// intentional gap, not a silent one.

import {
  HuebschError,
  describeHuebschError,
  getFromHuebsch,
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

describe('uploadToHuebsch / getFromHuebsch (fetch stubbed)', () => {
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
    expect(body.content[0].attrs.description).toBe('A lead.')
    expect(body.content[0].attrs.source).toBe('https://www.republik.ch/slug')
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

  it('getFromHuebsch throws with the parsed error when the webhook reports a failed generation', async () => {
    await expect(
      getFromHuebsch({
        ok: false,
        val: { error: 'voice "Unknown" not found', code: '422.x' },
      }),
    ).rejects.toThrow(/voice "Unknown" not found/)
  })

  it('getFromHuebsch throws a generic message when there is no asset url at all', async () => {
    await expect(getFromHuebsch({ ok: true, val: {} })).rejects.toThrow(
      /no asset url|had no asset url/,
    )
  })

  it('getFromHuebsch downloads the asset and surfaces chapters when present', async () => {
    const audioBytes = new Uint8Array([1, 2, 3]).buffer
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(audioBytes),
    }) as unknown as typeof fetch

    const result = await getFromHuebsch({
      ok: true,
      val: {
        asset: 'https://cdn.example.com/audio.mp3',
        chapters: [{ name: 'Intro', at: 0 }],
      },
    })

    expect(result.audioFile).toBe(audioBytes)
    expect(result.chapters).toEqual([{ name: 'Intro', at: 0 }])
  })

  it("getFromHuebsch converts Huebsch's duration (seconds) to rounded milliseconds", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    }) as unknown as typeof fetch

    const result = await getFromHuebsch({
      ok: true,
      val: { asset: 'https://cdn.example.com/audio.mp3', duration: 245.5 },
    })

    expect(result.durationMs).toBe(245500)
  })

  it('getFromHuebsch leaves durationMs undefined when Huebsch reports no duration', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    }) as unknown as typeof fetch

    const result = await getFromHuebsch({
      ok: true,
      val: { asset: 'https://cdn.example.com/audio.mp3' },
    })

    expect(result.durationMs).toBeUndefined()
  })
})
