import { MetadataRoute } from 'next'

const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://www.republik.ch'
const START_YEAR = 2017

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentYear = new Date().getFullYear()
  const sitemaps: MetadataRoute.Sitemap = []
  
  // Add yearly sitemaps via API routes
  for (let year = START_YEAR; year <= currentYear; year++) {
    sitemaps.push({
      url: `${BASE_URL}/api/sitemap/${year}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    })
  }
  
  return sitemaps
}
