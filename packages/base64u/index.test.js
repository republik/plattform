const { encode, decode, match } = require('./index')
const abab = require('abab')
const test = require('tape')

const testSeries = (env, runEnv) => {
  [
    { string: 'heidi', base64u: 'aGVpZGk' },
    { string: 'peter?_', base64u: 'cGV0ZXI_Xw' }, // Not urlsafe: cGV0ZXI/Xw
    { string: '12345><', base64u: 'MTIzNDU-PA' }, // Not urlsafe: MTIzNDU+PA
    { string: 'äöüáàâéèê', base64u: 'w6TDtsO8w6HDoMOiw6nDqMOq' },
    { string: 'π', base64u: 'z4A' },
    { string: '😈', base64u: '8J-YiA' }, // Not urlsafe: 8J+YiA
    { string: '\n', base64u: 'Cg' }
  ]
    .forEach(({ title, string, base64u }) => {
      test(
        `(${env}) base64u ${string} <-> ${base64u}`,
        assert => runEnv(
          assert,
          assert => {
            const encoded = encode(string)
            assert.equal(encoded, base64u)

            const decoded = decode(encoded)
            assert.equal(decoded, string)

            assert.end()
          }
        )
      )
    })

  test(
    `(${env}) base64u.decode w/ block padding "="`,
    assert => runEnv(
      assert,
      assert => {
        assert.equal(decode('a2xhcmE='), 'klara')
        assert.end()
      }
    )
  )

  test(
    `(${env}) base64u.decode w/o block padding "="`,
    assert => runEnv(
      assert,
      assert => {
        assert.equal(decode('a2xhcmE'), 'klara')
        assert.end()
      }
    )
  )

  test(
    `(${env}) base64u.match "a2xhcmE=" -> false`,
    assert => runEnv(
      assert,
      assert => {
        assert.equal(match('a2xhcmE='), false)
        assert.end()
      }
    )
  )

  test(
    `(${env}) base64u.match "a2xhcmE" -> true`,
    assert => runEnv(
      assert,
      assert => {
        assert.equal(match('a2xhcmE'), true)
        assert.end()
      }
    )
  )

  test(
    `(${env}) base64u.match "cGV0ZXI_Xw" -> true`,
    assert => runEnv(
      assert,
      assert => {
        assert.equal(match('cGV0ZXI_Xw'), true)
        assert.end()
      }
    )
  )

  test(
    `(${env}) base64u.match "cGV0ZXI/Xw" -> false`,
    assert => runEnv(
      assert,
      assert => {
        assert.equal(match('cGV0ZXI/Xw'), false)
        assert.end()
      }
    )
  )

  test(
    `(${env}) base64u.match "cGV0ZXI/Xw" -> false`,
    assert => runEnv(
      assert,
      assert => {
        assert.equal(match('cGV0ZXI/Xw'), false)
        assert.end()
      }
    )
  )
}

// Test Node.JS path
testSeries(
  'node',
  (assert, asserationFn) => {
    asserationFn(assert)
  }
)

// Test (emulated) Browser window global variable
testSeries(
  'browser',
  (assert, asserationFn) => {
    global.window = abab
    asserationFn(assert)
    global.window = undefined
  }
)
