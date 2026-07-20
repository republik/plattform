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
