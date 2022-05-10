import { getResizedSrcs } from './utils'

describe('Figure util test-suite', () => {
  test('getResizedSrcs: no size info', () => {
    const props = getResizedSrcs('image.jpg', 2000)
    expect(props.src).toBe('image.jpg')
    expect(props.size).toBeNull()
    expect(props.srcSet).toBeUndefined()
    expect(props.maxWidth).toBeUndefined()
  })

  test('getResizedSrcs: undefined src', () => {
    let props = {}
    expect(() => {
      props = getResizedSrcs(undefined, 2000)
    }).not.toThrow()
    expect(props.src).toBeUndefined()
    expect(props.size).toBeNull()
    expect(props.srcSet).toBeUndefined()
    expect(props.maxWidth).toBeUndefined()
  })

  test('getResizedSrcs: size info', () => {
    const props = getResizedSrcs('image.jpg?size=4500x2500', 2000)
    expect(props.src).toBe('image.jpg?size=4500x2500&resize=2000x')
    expect(props.size).toStrictEqual({
      width: 4500,
      height: 2500,
    })
    expect(props.srcSet).toBe(
      'image.jpg?size=4500x2500&resize=1000x 1000w,image.jpg?size=4500x2500&resize=2000x 2000w,image.jpg?size=4500x2500&resize=4000x 4000w',
    )
    expect(props.maxWidth).toBe(4500)
  })

  test('getResizedSrcs: undefined maxWidth if setMaxWidth is false', () => {
    const props = getResizedSrcs('image.jpg?size=4500x2500', 2000, false)
    expect(props.src).toBe('image.jpg?size=4500x2500&resize=2000x')
    expect(props.size).toStrictEqual({
      width: 4500,
      height: 2500,
    })
    expect(props.srcSet).toBe(
      'image.jpg?size=4500x2500&resize=1000x 1000w,image.jpg?size=4500x2500&resize=2000x 2000w,image.jpg?size=4500x2500&resize=4000x 4000w',
    )
    expect(props.maxWidth).toBeUndefined()
  })

  test('getResizedSrcs: skip retina if src is too small', () => {
    const props = getResizedSrcs('image.jpg?size=2000x1500', 2000)
    expect(props.src).toBe('image.jpg?size=2000x1500&resize=2000x')
    expect(props.size).toStrictEqual({
      width: 2000,
      height: 1500,
    })
    // no retina if it would be bigger or equal to the source
    expect(props.srcSet).toBe(
      'image.jpg?size=2000x1500&resize=1000x 1000w,image.jpg?size=2000x1500&resize=2000x 2000w',
    )
    expect(props.maxWidth).toBe(2000)
  })

  test('getResizedSrcs: add semi retina if src is too small for full retina', () => {
    const props = getResizedSrcs('image.jpg?size=3000x1500', 2000)
    expect(props.src).toBe('image.jpg?size=3000x1500&resize=2000x')
    expect(props.size).toStrictEqual({
      width: 3000,
      height: 1500,
    })
    // no retina if it would be bigger or equal to the source
    expect(props.srcSet).toBe(
      'image.jpg?size=3000x1500&resize=1000x 1000w,image.jpg?size=3000x1500&resize=2000x 2000w,image.jpg?size=3000x1500&resize=3000x 3000w',
    )
    expect(props.maxWidth).toBe(3000)
  })

  test('getResizedSrcs: do not resize svg', () => {
    const props = getResizedSrcs('image.svg?size=2x1', 2000)
    expect(props.src).toBe('image.svg?size=2x1')
    expect(props.size).toStrictEqual({
      width: 2,
      height: 1,
    })
    expect(props.srcSet).toBeUndefined()
  })
})
