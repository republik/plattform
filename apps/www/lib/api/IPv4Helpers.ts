/**
 * Convert an IPv4 address to a number made up of at max 32 bits.
 * @param ip address in IPv4 format
 * @returns number between 0 and 2^32 -1
 */
export function ipv4ToInt(ip: string): bigint {
  const octets = ip.split('.').map(BigInt)
  if (octets.length !== 4) {
    throw new Error(`Invalid value '${ip}' passed but required a valid IP`)
  }

  let number = BigInt(0)
  for (let i = 0; i < octets.length; i++) {
    number = (number << BigInt(8)) + octets[i]
  }
  return number
}

/**
 * Convert a number to an IPv4 address string
 * @param ipInt number between 0 and 2^32 -1
 * @returns IPv4 address string
 */
export function intToIpv4(ipInt: bigint): string {
  if (ipInt < 0 || ipInt > Math.pow(2, 32) - 1) {
    throw new Error(
      `Only numbers between 0 and 2^32 -1 can be converted to an IPV4 address format. Provided: ${ipInt}`,
    )
  }
  const octets = []
  for (let i = 3; i >= 0; i--) {
    octets[i] = Number(ipInt & BigInt(0xff))
    ipInt >>= BigInt(8)
  }
  return octets.map((val: bigint) => Number(val)).join('.')
}
