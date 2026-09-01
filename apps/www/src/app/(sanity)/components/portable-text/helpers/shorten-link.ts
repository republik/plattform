/**
 * Shortens a URL for display: keeps the host plus the last path segment and
 * elides everything in between. Query strings and trailing slashes are
 * dropped. Anything that is not a parsable URL is returned unchanged.
 *
 * `base` resolves root-relative paths — an internal reference resolved to
 * `/2025/02/20/an-article` shortens against the site's own origin.
 *
 * Ported from @project-r/styleguide ExpandableLinkCallout.
 */
export function shortenLink(url?: string, base?: string): string | undefined {
  if (!url) return

  let addr: URL
  try {
    addr = new URL(url, base)
  } catch {
    return url
  }

  const { host, pathname } = addr
  // remove trailing forward slash
  const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  // two or more forward slashes means there are subpaths (/foo/bar) to elide
  const hasSubPaths = (cleanPath.match(/\//g) ?? []).length >= 2
  // select the last path item, if it has subpaths, add ellipsis
  const lastPath =
    cleanPath &&
    `${hasSubPaths ? '/.../' : '/'}${cleanPath.match(/([^/]*$)/g)[0]}`

  return `${host}${lastPath}`
}
