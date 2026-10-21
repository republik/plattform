/**
 * Resolve the client IP behind a known number of trusted reverse proxies.
 * Proxies APPEND to X-Forwarded-For, so the leftmost entries are client
 * supplied and must not be trusted. Counts trusted hops from the right.
 * Mirrors packages/backend-modules/base/lib/clientIp.js.
 *
 * TRUST_PROXY_HOPS overrides the hop count (default: 1 in production,
 * 0 otherwise = use the socket address, if any).
 */
export function getTrustProxyHops(
  env: Record<string, string | undefined> = process.env,
): number {
  const fallback = env.NODE_ENV === 'production' ? 1 : 0
  const raw = env.TRUST_PROXY_HOPS
  if (raw === undefined || raw.trim() === '') return fallback
  const hops = Number(raw)
  return Number.isInteger(hops) && hops >= 0 ? hops : fallback
}

export function resolveClientIP(
  forwardedFor: string | string[] | null | undefined,
  remoteAddress?: string | null,
  hops: number = getTrustProxyHops(),
): string | null {
  const entries = (Array.isArray(forwardedFor) ? forwardedFor : [forwardedFor])
    .filter((v): v is string => typeof v === 'string')
    .flatMap((v) => v.split(','))
    .map((v) => v.trim())
    .filter(Boolean)

  const ip =
    hops <= 0 || entries.length === 0
      ? remoteAddress
      : entries[Math.max(0, entries.length - hops)]

  return ip?.trim() || null
}
