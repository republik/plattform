export type ProfileUrlPlatform =
  | 'bluesky'
  | 'facebook'
  | 'x'
  | 'threema'
  | 'signal'
  | 'linkedin'
  | 'telegram'
  | 'youtube'
  | 'mastodon'

const PLATFORM_DOMAINS: [ProfileUrlPlatform, string[]][] = [
  ['bluesky', ['bsky.app']],
  ['facebook', ['facebook.com']],
  ['x', ['x.com', 'twitter.com']],
  ['threema', ['threema.id']],
  ['signal', ['signal.me']],
  ['linkedin', ['linkedin.com']],
  ['telegram', ['t.me']],
  ['youtube', ['youtube.com', 'youtu.be']],
]

// Match only the host (exact domain or a subdomain of it), so that
// e.g. https://evil.example/#x.com/handle isn't treated as an X profile.
const matchesDomain = (hostname: string, domain: string) =>
  hostname === domain || hostname.endsWith('.' + domain)

const isMastodon = (hostname: string, pathname: string) =>
  // Mastodon instances commonly have "mastodon" in their hostname,
  // remote profiles look like https://instance/@user@other.instance
  hostname.split('.').some((label) => label.includes('mastodon')) ||
  /^\/@[^/@]+@[^/@]+/.test(pathname)

const detectPlatform = (url: URL): ProfileUrlPlatform | null => {
  const hostname = url.hostname.toLowerCase()

  const match = PLATFORM_DOMAINS.find(([, domains]) =>
    domains.some((domain) => matchesDomain(hostname, domain)),
  )
  if (match) {
    return match[0]
  }
  if (isMastodon(hostname, url.pathname)) {
    return 'mastodon'
  }
  return null
}

const getLabel = (platform: ProfileUrlPlatform | null, url: URL): string => {
  const pathSegments = url.pathname.split('/').filter(Boolean)

  switch (platform) {
    case 'bluesky': {
      const handle =
        pathSegments[0] === 'profile' ? pathSegments[1] : undefined
      return handle || 'Bluesky'
    }
    case 'facebook':
      return 'Facebook'
    case 'x':
      return pathSegments[0] || 'X'
    case 'threema':
      return pathSegments[0] || 'Threema'
    case 'signal':
      return 'Signal'
    case 'linkedin':
      return 'LinkedIn'
    case 'mastodon':
      return url.pathname.match(/@[A-Za-z0-9_]+/)?.[0] ?? 'Mastodon'
    default:
      return url.host || url.href
  }
}

export type ParsedProfileUrl = {
  platform: ProfileUrlPlatform | null
  label: string
}

/**
 * Parses a profile URL, determines the platform from its hostname and
 * derives a display label (e.g. the handle). Returns null if the URL
 * can't be parsed.
 */
export const parseProfileUrl = (url: string): ParsedProfileUrl | null => {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch (e) {
    return null
  }
  const platform = detectPlatform(parsed)
  return { platform, label: getLabel(platform, parsed) }
}
