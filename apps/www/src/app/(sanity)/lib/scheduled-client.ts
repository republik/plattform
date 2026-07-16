import type { ClientPerspective } from 'next-sanity'
import { client } from './client'

// Server-only client used for "coming soon" teasers. The 'scheduled'
// perspective overlays only content with an actual publication schedule —
// unlike 'drafts', it never exposes work-in-progress drafts.
// SANITY_API_READ_TOKEN is not NEXT_PUBLIC_*, so this only works in server
// code — never import this from a client component. Keep projections
// restricted: anything queried here is not published yet.
export const scheduledClient = client.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
  // 'scheduled' is accepted by the API but missing from the installed
  // @sanity/client's ClientPerspective union — cast until the types catch up
  perspective: 'scheduled' as ClientPerspective,
  useCdn: false,
  stega: false,
})
