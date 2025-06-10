import { MetadataRoute } from 'next'

const BASE_URL = process.env.PUBLIC_BASE_URL
const START_YEAR = 2017

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentYear = new Date().getFullYear()
  const sitemaps: MetadataRoute.Sitemap = []
  
  // Add yearly sitemaps via API routes
  for (let year = START_YEAR; year <= currentYear; year++) {
    sitemaps.push({
      url: `${BASE_URL}/api/${year}/sitemap`,
      lastModified: new Date(),
    })
  }

  for (let year = START_YEAR; year <= currentYear; year++) {
    sitemaps.push({
      url: `${BASE_URL}/api/${year}/news-sitemap`,
      lastModified: new Date(), 
    })
  }

  sitemaps.push({
    url: `${BASE_URL}/api/profile-sitemap`,
    lastModified: new Date(),
  })
  
  return sitemaps
}
