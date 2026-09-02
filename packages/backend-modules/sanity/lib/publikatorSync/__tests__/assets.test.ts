const upload = jest.fn().mockResolvedValue({ _id: 'image-abc123-800x600-jpg' })

jest.mock('../../client', () => ({
  sanityClient: () => ({ assets: { upload } }),
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolveAssetMarkers } = require('../assets')

describe('publikatorSync/assets resolveAssetMarkers', () => {
  beforeEach(() => {
    upload.mockClear()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    }) as unknown as typeof fetch
  })

  it('replaces a _sanityAsset marker with a real asset reference', async () => {
    const doc = {
      _type: 'article',
      content: [
        {
          _type: 'editorialImage',
          _sanityAsset: 'image@https://cdn.repub.ch/s3/republik-assets/a.jpg',
          alt: 'a photo',
        },
      ],
    }

    const result = await resolveAssetMarkers(doc)

    expect(upload).toHaveBeenCalledTimes(1)
    const image = result.content[0]
    expect(image._sanityAsset).toBeUndefined()
    expect(image.asset).toEqual({
      _type: 'reference',
      _ref: 'image-abc123-800x600-jpg',
    })
    expect(image.alt).toBe('a photo')
  })

  it('uploads a repeated image URL only once', async () => {
    const doc = {
      a: { _sanityAsset: 'image@https://cdn.repub.ch/s3/x/1.jpg' },
      b: { _sanityAsset: 'image@https://cdn.repub.ch/s3/x/1.jpg' },
    }

    await resolveAssetMarkers(doc)

    expect(upload).toHaveBeenCalledTimes(1)
  })

  it('drops the marker without crashing when the fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch
    const doc = {
      content: [{ _sanityAsset: 'image@https://cdn.repub.ch/s3/x/missing.jpg' }],
    }

    const result = await resolveAssetMarkers(doc)

    expect(result.content[0]._sanityAsset).toBeUndefined()
    expect(result.content[0].asset).toBeUndefined()
  })
})
