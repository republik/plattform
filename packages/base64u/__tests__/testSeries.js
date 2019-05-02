const { encode, decode, match } = require('../index')

const testSeries = () => {
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
      test(`base64u ${string.replace('\n', '\\n')} <-> ${base64u}`, () => {
        const encoded = encode(string)
        expect(encoded).toEqual(base64u)

        const decoded = decode(encoded)
        expect(decoded).toEqual(string)
      })
    })

  test(`base64u.decode w/ block padding "="`, () => {
    expect(decode('a2xhcmE=')).toEqual('klara')
  })

  test(`base64u.decode w/o block padding "="`, () => {
    expect(decode('a2xhcmE')).toEqual('klara')
  })

  test(`base64u.match "a2xhcmE=" -> false`, () => {
    expect(match('a2xhcmE=')).toEqual(false)
  })

  test(`base64u.match "a2xhcmE" -> true`, () => {
    expect(match('a2xhcmE')).toEqual(true)
  })

  test(`base64u.match "cGV0ZXI_Xw" -> true`, () => {
    expect(match('cGV0ZXI_Xw')).toEqual(true)
  })

  test(`base64u.match "cGV0ZXI/Xw" -> false`, () => {
    expect(match('cGV0ZXI/Xw')).toEqual(false)
  })

  test(`base64u.match "cGV0ZXI/Xw" -> false`, () => {
    expect(match('cGV0ZXI/Xw')).toEqual(false)
  })
}

module.exports = testSeries
