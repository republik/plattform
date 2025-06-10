import { MetadataRoute } from 'next'

const BASE_URL = process.env.PUBLIC_BASE_URL
const START_YEAR = 2017

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentYear = new Date().getFullYear()
  const sitemaps: MetadataRoute.Sitemap = []
  
  const today4am = new Date()
  today4am.setHours(4, 0, 0, 0)
  
  for (let year = START_YEAR; year <= currentYear; year++) {
    const lastModified = year === currentYear 
      ? today4am 
      : new Date(year, 11, 31)
    
    sitemaps.push({
      url: `${BASE_URL}/api/${year}/sitemap`,
      lastModified,
    })
  }

  for (let year = START_YEAR; year <= currentYear; year++) {
    const lastModified = year === currentYear 
      ? today4am 
      : new Date(year, 11, 31)
    
    sitemaps.push({
      url: `${BASE_URL}/api/${year}/news-sitemap`,
      lastModified, 
    })
  }

  sitemaps.push({
    url: `${BASE_URL}/api/profile-sitemap`,
    lastModified: today4am,
  })
  
  return sitemaps
}
