import { defineLive } from 'next-sanity/live'
import { baseClient } from './client'

export const { sanityFetch, SanityLive } = defineLive({
  client: baseClient,
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_READ_TOKEN,
})
