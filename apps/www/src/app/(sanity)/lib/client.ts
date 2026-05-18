import { createClient } from 'next-sanity'
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL
if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
if (!studioUrl) throw new Error('Missing NEXT_PUBLIC_SANITY_STUDIO_URL')

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-02-01',
  useCdn: false,
  stega: {
    studioUrl,
  },
})
