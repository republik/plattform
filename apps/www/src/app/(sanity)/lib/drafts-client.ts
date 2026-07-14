import { client } from './client'

// Server-only client that can read draft documents (e.g. scheduled articles).
// SANITY_API_READ_TOKEN is not NEXT_PUBLIC_*, so this only works in server
// code — never import this from a client component. Keep projections
// restricted: anything queried here is unpublished content.
export const draftsClient = client.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'drafts',
  useCdn: false,
  stega: false,
})
