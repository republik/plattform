/**
 * Check if age.jest.js global.Date has any influence.
 */

test.skip('Date ok?', done => {
  console.log('a', new Date())

  setTimeout(() => {
    console.log('b', new Date())
    done()
  }, 1000)
})
