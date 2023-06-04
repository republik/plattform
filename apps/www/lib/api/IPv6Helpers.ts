/**
 * Expand a shortened IPv6 address to a full IPv6 address
 * @param ip IPv6 address that might be shortened
 * @returns The expanded IPv6 address consisting out of 8 blocks of 16bit
 */
export function expandIPv6(ip: string): string {
  if (!ip.includes('::')) {
    return ip
  }
  const [left, right] = ip.split('::')
  const leftParts = left.split(':').filter(Boolean)
  const rightParts = right.split(':').filter(Boolean)
  // 8 blocks are required for a full expanded IPv6 address
  const pad = 8 - (leftParts.length + rightParts.length)
  // All blocks that are missing are to be added on the right side of the '::'
  for (let i = 0; i < pad; i++) {
    leftParts.push('0')
  }

  return [...leftParts.filter(Boolean), ...rightParts].join(':')
}
