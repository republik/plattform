import { createClient } from '@sanity/client'

// Generic, reusable Sanity content client — any integration that needs to
// read/write Sanity documents directly (as opposed to the discussions
// webhook, which only touches Postgres) should get its client from here.
export const createSanityClient = () =>
  createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: process.env.SANITY_API_VERSION ?? '2026-06-12',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
  })

// The shared instance, built on first use rather than at import time: the
// SANITY_* env vars it reads aren't necessarily loaded when a module importing
// it is imported (a script's ES imports are hoisted above its `env.config()`
// call, see script/migrate-legacy-references.ts), and requiring one of these
// modules must not hard-fail for consumers that only want its pure helpers.
let client: ReturnType<typeof createSanityClient> | undefined
export const sanityClient = () => (client ??= createSanityClient())
