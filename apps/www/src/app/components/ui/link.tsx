import NextLink from 'next/link'
import type { ComponentProps } from 'react'

export type LinkProps = ComponentProps<typeof NextLink>

/**
 * `next/link` with prefetching off by default. Import this instead of
 * `next/link` anywhere in the app.
 *
 * Next prefetches every Link that scrolls into the viewport. Most routes here
 * render dynamically — the (sanity) layout reads cookies via `draftMode()` and
 * `getMe()` — so a prefetch is a full server render rather than a static file.
 * On link-dense pages that is enough to trip rate limiting: /rubriken alone
 * carries ~100 internal links, so a couple of reloads fire a couple of hundred
 * renders. Next 16 has no config switch that simply turns prefetching off
 * (`staleTimes` tunes reuse, `partialPrefetching` requires `cacheComponents`),
 * so the default lives here.
 *
 * Hovering still prefetches, which is the intent-driven behaviour we want.
 * Pass `prefetch` explicitly to opt a link back in.
 */
export default function Link({ prefetch = false, ...props }: LinkProps) {
  return <NextLink prefetch={prefetch} {...props} />
}
