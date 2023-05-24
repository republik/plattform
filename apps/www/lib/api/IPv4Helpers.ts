/**
 * Convert an IPv4 address to a number.
 *
 */
export function ipv4ToInt(ip: string): number {
  const octets = ip.split('.').map(Number)
  if (octets.length !== 4) {
    throw new Error(`Invalid value '${ip}' passed but required a valid IP`)
  }
  return octets.reduce((acc, octet, index) => {
    return acc + octet * Math.pow(256, 3 - index)
  }, 0)
}

/**
 * Convert a number made up of at max 32 bits to an IPv4 address.
 * @param ipInt
 * @returns
 */
export function intToIpv4(ipInt: number): string {
  if (ipInt < 0 || ipInt > Math.pow(2, 32) - 1) {
    throw new Error(
      `Only numbers between 0 and 2^32 -1 can be converted to an IPV4 address format. Provided: ${ipInt}`,
    )
  }
  const octets = []
  for (let i = 3; i >= 0; i--) {
    octets[i] = Math.floor(ipInt / Math.pow(256, i))
    ipInt -= octets[i] * Math.pow(256, i)
  }
  return octets.reverse().join('.')
}
