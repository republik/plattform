import test from 'tape'

import { getResizedSrcs } from './utils'

test('getResizedSrcs: no size info', assert => {
  const props = getResizedSrcs('image.jpg', 2000)
  assert.equal(props.src, 'image.jpg')
  assert.equal(props.size, null)
  assert.equal(props.srcSet, undefined)
  assert.equal(props.maxWidth, undefined)

  assert.end()
})

test('getResizedSrcs: undefined src', assert => {
  let props = {}
  assert.doesNotThrow(
    () => {
      props = getResizedSrcs(undefined, 2000)
    },
    'handle undefined src gracefully'
  )
  

  assert.equal(props.src, undefined)
  assert.equal(props.size, null)
  assert.equal(props.srcSet, undefined)
  assert.equal(props.maxWidth, undefined)

  assert.end()
})

test('getResizedSrcs: size info', assert => {
  const props = getResizedSrcs('image.jpg?size=4500x2500', 2000)
  assert.equal(props.src, 'image.jpg?size=4500x2500&resize=2000x')
  assert.deepEqual(props.size, {
    width: 4500,
    height: 2500
  })
  assert.equal(props.srcSet, 'image.jpg?size=4500x2500&resize=4000x 4000w')
  assert.equal(props.maxWidth, 4500)

  assert.end()
})

test('getResizedSrcs: undefined maxWidth if fillMaxWidth is false', assert => {
  const props = getResizedSrcs('image.jpg?size=4500x2500', 2000, false)
  assert.equal(props.src, 'image.jpg?size=4500x2500&resize=2000x')
  assert.deepEqual(props.size, {
    width: 4500,
    height: 2500
  })
  assert.equal(props.srcSet, 'image.jpg?size=4500x2500&resize=4000x 4000w')
  assert.equal(props.maxWidth, undefined)

  assert.end()
})

test('getResizedSrcs: skip retina if src is too small', assert => {
  const props = getResizedSrcs('image.jpg?size=2000x1500', 2000)
  assert.equal(props.src, 'image.jpg?size=2000x1500&resize=2000x')
  assert.deepEqual(props.size, {
    width: 2000,
    height: 1500
  })
  // no retina if it would be bigger or equal to the source
  assert.equal(props.srcSet, undefined)
  assert.equal(props.maxWidth, 2000)

  assert.end()
})

test('getResizedSrcs: add semi retina if src is too small for full retina', assert => {
  const props = getResizedSrcs('image.jpg?size=3000x1500', 2000)
  assert.equal(props.src, 'image.jpg?size=3000x1500&resize=2000x')
  assert.deepEqual(props.size, {
    width: 3000,
    height: 1500
  })
  // no retina if it would be bigger or equal to the source
  assert.equal(props.srcSet, 'image.jpg?size=3000x1500&resize=3000x 3000w')
  assert.equal(props.maxWidth, 3000)

  assert.end()
})
