import { createClient } from '@sanity/client'

// Prepended to every request tag (`<prefix>.<tag>`, or just `<prefix>` for an
// untagged request) so the backend's traffic is told apart from the
// frontend's and Studio's in Sanity's request logs and usage dashboard. Give
// each read its own `tag` (e.g. `documents.by-repo-id`) so callers sharing a
// query stay distinguishable too.
const REQUEST_TAG_PREFIX = 'backend'

export interface SanityClientOptions {
  // Serve reads from Sanity's API CDN instead of the live API. Only safe for
  // `published`-perspective reads that tolerate the CDN lagging a mutation
  // by a few seconds — anything reading drafts/versions, or reading back
  // what it is about to write, must stay on the live API (the default).
  useCdn?: boolean
}

// Generic, reusable Sanity content client — any integration that needs to
// read/write Sanity documents directly (as opposed to the discussions
// webhook, which only touches Postgres) should get its client from here.
export const createSanityClient = ({
  useCdn = false,
}: SanityClientOptions = {}) =>
  createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: process.env.SANITY_API_VERSION ?? '2026-06-12',
    token: process.env.SANITY_API_TOKEN,
    useCdn,
    requestTagPrefix: REQUEST_TAG_PREFIX,
  })

// The shared instances (one per `useCdn` setting), built on first use rather
// than at import time: the SANITY_* env vars they read aren't necessarily
// loaded when a module importing them is imported (a script's ES imports are
// hoisted above its `env.config()` call, see
// script/migrate-legacy-subscriptions.ts), and requiring one of these modules
// must not hard-fail for consumers that only want its pure helpers.
let liveClient: ReturnType<typeof createSanityClient> | undefined
let cdnClient: ReturnType<typeof createSanityClient> | undefined
export const sanityClient = ({ useCdn = false }: SanityClientOptions = {}) =>
  useCdn
    ? (cdnClient ??= createSanityClient({ useCdn: true }))
    : (liveClient ??= createSanityClient())
