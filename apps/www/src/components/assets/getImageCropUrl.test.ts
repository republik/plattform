import { getImageCropURL } from './getImageCropURL'

describe('getImageCropUrl', () => {
  it('should fallback to given {size} argument if no size is defined', () => {
    expect(getImageCropURL('https://www.example.com/image.jpg', 100)).toEqual(
      'https://www.example.com/image.jpg?size=100x100&resize=100x',
    )
  })

  it('should correctly apply crop parameters', () => {
    expect(
      getImageCropURL('https://www.example.com/image.jpg?size=200x200', 100, {
        x: 10,
        y: 20,
        width: 50,
        height: 60,
      }),
    ).toEqual(
      'https://www.example.com/image.jpg?size=200x200&crop=10x20y50w60h&resize=100x',
    )
  })
})
