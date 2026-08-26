const vimeoGet = jest.fn()
const youtubeGet = jest.fn()

jest.mock('@orbiting/backend-modules-embeds', () => ({
  vimeo: {
    REGEX:
      /^(?:http|https)?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|)(\d+)(?:|\/\?)/,
    get: (id: string) => vimeoGet(id),
  },
  youtube: {
    REGEX:
      /^http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&[^\s]*)*/,
    get: (id: string) => youtubeGet(id),
  },
}))

import { fetchEmbedVideoHandler } from '../fetchEmbedVideo'

function mockReqRes(query: Record<string, unknown>) {
  const req: any = { query, log: { error: jest.fn() } }
  const res: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json: jest.fn(function (this: any, body: unknown) {
      this.body = body
      return this
    }),
  }
  return { req, res }
}

describe('fetchEmbedVideoHandler', () => {
  beforeEach(() => {
    vimeoGet.mockReset()
    youtubeGet.mockReset()
  })

  it('rejects an unsupported platform', async () => {
    const { req, res } = mockReqRes({
      platform: 'twitter',
      url: 'https://twitter.com/x',
    })
    await fetchEmbedVideoHandler(req, res)
    expect(res.statusCode).toBe(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
    )
  })

  it('rejects a missing url', async () => {
    const { req, res } = mockReqRes({ platform: 'vimeo' })
    await fetchEmbedVideoHandler(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('rejects a url that does not match the selected platform', async () => {
    const { req, res } = mockReqRes({
      platform: 'vimeo',
      url: 'https://youtube.com/watch?v=abc123',
    })
    await fetchEmbedVideoHandler(req, res)
    expect(res.statusCode).toBe(400)
    expect(vimeoGet).not.toHaveBeenCalled()
  })

  it('fetches and normalizes vimeo metadata', async () => {
    const createdAt = new Date('2020-01-01T00:00:00.000Z')
    const retrievedAt = new Date('2026-08-26T00:00:00.000Z')
    vimeoGet.mockResolvedValue({
      id: '12345',
      platform: 'vimeo',
      createdAt,
      retrievedAt,
      userUrl: 'https://vimeo.com/user',
      userName: 'Some User',
      userProfileImageUrl: 'https://example.com/avatar.jpg',
      thumbnail: 'https://example.com/thumb.jpg',
      title: 'A video',
      aspectRatio: 1.78,
      src: {
        mp4: 'https://example.com/a.mp4',
        hls: 'https://example.com/a.m3u8',
        thumbnail: 'https://example.com/thumb.jpg',
      },
      durationMs: 12000,
    })

    const { req, res } = mockReqRes({
      platform: 'vimeo',
      url: 'https://vimeo.com/12345',
    })
    await fetchEmbedVideoHandler(req, res)

    expect(vimeoGet).toHaveBeenCalledWith('12345')
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '12345',
        title: 'A video',
        mediaId: 'vimeo-12345',
        createdAt: createdAt.toISOString(),
        retrievedAt: retrievedAt.toISOString(),
        src: expect.objectContaining({ mp4: 'https://example.com/a.mp4' }),
      }),
    )
  })

  it('fetches youtube metadata using the youtube id extracted from the url', async () => {
    youtubeGet.mockResolvedValue({
      id: 'abc123',
      platform: 'youtube',
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
      retrievedAt: new Date('2026-08-26T00:00:00.000Z'),
      userUrl: 'https://www.youtube.com/channel/xyz',
      userName: 'Some Channel',
      thumbnail: 'https://example.com/thumb.jpg',
      title: 'A youtube video',
      userProfileImageUrl: '',
      aspectRatio: 1.78,
      durationMs: 5000,
    })

    const { req, res } = mockReqRes({
      platform: 'youtube',
      url: 'https://www.youtube.com/watch?v=abc123',
    })
    await fetchEmbedVideoHandler(req, res)

    expect(youtubeGet).toHaveBeenCalledWith('abc123')
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'abc123', mediaId: 'youtube-abc123' }),
    )
  })

  it('surfaces an upstream API error as a 502', async () => {
    vimeoGet.mockRejectedValue(new Error('Vimeo API Error: not found.'))

    const { req, res } = mockReqRes({
      platform: 'vimeo',
      url: 'https://vimeo.com/999',
    })
    await fetchEmbedVideoHandler(req, res)

    expect(res.statusCode).toBe(502)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Vimeo API Error: not found.' }),
    )
  })
})
