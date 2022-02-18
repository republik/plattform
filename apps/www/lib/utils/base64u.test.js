import { encode, decode, match } from './base64u'
import abab from 'abab'

describe('/lib/utils/base64u.js', () => {
  it('should decode and encode correctly', () => {
    ;[
      { string: 'heidi', base64u: 'aGVpZGk' },
      { string: 'peter?_', base64u: 'cGV0ZXI_Xw' }, // Not urlsafe: cGV0ZXI/Xw
      { string: '12345><', base64u: 'MTIzNDU-PA' }, // Not urlsafe: MTIzNDU+PA
      { string: 'äöüáàâéèê', base64u: 'w6TDtsO8w6HDoMOiw6nDqMOq' },
      { string: 'π', base64u: 'z4A' },
      { string: '😈', base64u: '8J-YiA' }, // Not urlsafe: 8J+YiA
      { string: '\n', base64u: 'Cg' },
    ].forEach(({ string, base64u }) => {
      expect(encode(string)).toBe(base64u)
      expect(decode(base64u)).toBe(string)
    })
  })

  it('should decode with block padding', () => {
    expect(decode('a2xhcmE=')).toBe('klara')
  })

  it('should decode without block padding', () => {
    expect(decode('a2xhcmE')).toBe('klara')
  })

  it('should validate b64 string', () => {
    expect(match('a2xhcmE=')).toBeFalsy()
    expect(match('a2xhcmE')).toBeTruthy()
    expect(match('cGV0ZXI_Xw')).toBeTruthy()
    expect(match('cGV0ZXI/Xw')).toBeFalsy()
    expect(match('cGV0ZXI/Xw')).toBeFalsy()
  })
})
