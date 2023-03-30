import net from 'node:net'

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
  const ipArray = ip.split('.')
  ipArray.splice(3, 1, '0')
  const maskedIp4 = ipArray.join('.')
  return maskedIp4
}
