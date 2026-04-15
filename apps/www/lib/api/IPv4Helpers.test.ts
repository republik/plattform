import { intToIpv4, ipv4ToInt } from './IPv4Helpers'

describe('IPHelper test-suite', () => {
  test('should convert address correctly to number', () => {
    expect(ipv4ToInt('0.0.0.0')).toBe(BigInt(0))
    expect(ipv4ToInt('255.255.255.255')).toBe(BigInt(4294967295))
    expect(ipv4ToInt('1.1.1.1')).toBe(BigInt(16843009))
    expect(ipv4ToInt('127.0.0.1')).toBe(BigInt(2130706433))
    expect(ipv4ToInt('192.168.10.20')).toBe(BigInt(3232238100))
  })

  test('should convert number correctly to ipV4 address', () => {
    expect(intToIpv4(BigInt(2130706433))).toBe('127.0.0.1')
    expect(intToIpv4(BigInt(0))).toBe('0.0.0.0')
    expect(intToIpv4(BigInt(4294967295))).toBe('255.255.255.255')
    expect(() => intToIpv4(BigInt(-1))).toThrowError()
    expect(() => intToIpv4(BigInt(4294967296))).toThrowError()
  })
})
