import net from 'node:net'
import { intToIpv4, ipv4ToInt } from './IPv4Helpers'
import { expandIPv6 } from './IPv6Helpers'

// A IPv4 address constists of 4 octets = 32bit
// Must be a multiple of 8 to get rid of a full octet
const RETAINED_BITS_IN_IPv4_MASKING = 24 // 3 octets
// A IPv6 address constists of 8 blocks of 16bit = 128bit
// Can only be a mutiple of 16.
const RETAINED_BITS_IN_IPv6_MASKING = 48 // 3 blocks

export default function truncateIP(ip: string): string {
  const ipV = net.isIP(ip)
  if (ipV === 0) {
    throw new Error('no valid IP supplied: ' + ip)
  }
  if (ipV === 6) {
    return maskIpv6(ip)
  }
  return maskIpv4(ip)
}

function maskIpv6(ip: string): string {
  const expandedIP = expandIPv6(ip)
  // Retain
  return expandIPv6(
    expandedIP
      .split(':')
      .slice(0, RETAINED_BITS_IN_IPv6_MASKING / 16)
      .join(':') + '::',
  )
}

function maskIpv4(ip: string): string {
  const numIP = ipv4ToInt(ip)
  const maskedIp =
    numIP & BigInt(0xffffffff << (32 - RETAINED_BITS_IN_IPv4_MASKING))
  return intToIpv4(maskedIp)
}
