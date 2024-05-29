const { makeCorsOptionsDelegateFunc } = require('../lib/cors-delegate')

describe('custom cors-delegate with wildcard domain support', () => {
  const callback = (err, y) => {
    if (err) throw new Error(err)
    return y
  }

  function testAllowed(origin, corsList) {
    const res = makeCorsOptionsDelegateFunc(corsList, {
      origin: true,
    })

    test(`✅ - origin '${origin}' is allowed with cors-list '${JSON.stringify(
      corsList,
    )}'`, () => {
      expect(res({ headers: { origin } }, callback)).toEqual({
        // origin true, will reflect the request origin
        origin: true,
      })
    })
  }

  function testNotAllowed(origin, corsList) {
    const res = makeCorsOptionsDelegateFunc(corsList, {
      origin: true,
    })

    test(`⛔ - origin '${origin}' is not allowed with cors-list '${JSON.stringify(
      corsList,
    )}'`, () => {
      expect(() => res({ headers: { origin } }, callback)).toThrowError(
        'Not allowed by CORS',
      )
    })
  }

  const corsList = [
    'http://example.com',
    'http://example2.com',
    'http://*.example.com',
    'http://*.foo.example2.com',
  ]

  testAllowed('http://example.com', corsList)
  testAllowed('http://example2.com', corsList)
  // allowed under *.example.com
  testAllowed('http://foo.example.com', corsList)
  testAllowed('http://bar.example.com', corsList)
  testAllowed('http://foo.bar.example.com', corsList)
  // allowed under *.foo.example2.com
  testAllowed('http://foo.foo.example2.com', corsList)

  testNotAllowed('http://example3.com', corsList)
  testNotAllowed('http://bar.example2.com', corsList)
})
