import net from 'node:net'
import { intToIpv4, ipv4ToInt } from './IPv4Helpers'

export default function truncateIP(ip: string): string {
  const ipV = net.isIP(ip)
  if (ipV === 0) {
    throw new Error('no valid IP supplied')
  }
  if (ipV === 6) {
    return maskIpv6(ip)
  }
  return maskIpv4(ip)
}

function maskIpv6(ip: string): string {
  const ipArray = ip.split(':')
  ipArray.splice(6, 2, '0', '0')
  const maskedIp6 = ipArray.join(':')
  return maskedIp6
}

function maskIpv4(ip: string): string {
  const numIP = ipv4ToInt(ip)
  const maskedIp = numIP & 0xff_ff_ff_00 // retain only first 3 octets¨
  return intToIpv4(maskedIp)
}
