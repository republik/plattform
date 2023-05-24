import { intToIpv4, ipv4ToInt } from './IPv4Helpers'

describe('IPHelper test-suite', () => {
  test('should convert address correctly to number', () => {
    expect(ipv4ToInt('127.0.0.1')).toBe(2130706433)
    expect(ipv4ToInt('192.168.10.20')).toBe(3232238100)
    expect(ipv4ToInt('0.0.0.0')).toBe(0)
    expect(ipv4ToInt('255.255.255.255')).toBe(4294967295)
  })

  test('should convert number correctly to ipV4 address', () => {
    expect(intToIpv4(2130706433)).toBe('127.0.0.1')
    expect(intToIpv4(0)).toBe('0.0.0.0')
    expect(intToIpv4(4294967295)).toBe('255.255.255.255')
    expect(() => intToIpv4(-1)).toThrowError()
    expect(() => intToIpv4(4294967296)).toThrowError()
  })
})
