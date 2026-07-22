export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL
export const apiToken = process.env.SANITY_API_READ_TOKEN

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
if (!studioUrl) throw new Error('Missing NEXT_PUBLIC_SANITY_STUDIO_URL')
