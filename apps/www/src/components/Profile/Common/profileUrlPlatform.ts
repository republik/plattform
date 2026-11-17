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

export type ParsedProfileUrl = {
  platform: ProfileUrlPlatform | null
  url: URL
}

/**
 * Parses a profile URL and determines the platform from its hostname.
 * Returns null if the URL can't be parsed.
 */
export const parseProfileUrl = (url: string): ParsedProfileUrl | null => {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch (e) {
    return null
  }
  const hostname = parsed.hostname.toLowerCase()

  const match = PLATFORM_DOMAINS.find(([, domains]) =>
    domains.some((domain) => matchesDomain(hostname, domain)),
  )
  if (match) {
    return { platform: match[0], url: parsed }
  }
  if (isMastodon(hostname, parsed.pathname)) {
    return { platform: 'mastodon', url: parsed }
  }
  return { platform: null, url: parsed }
}
