import { NextRequest } from 'next/server'

const BASE_URL = process.env.PUBLIC_BASE_URL
const START_YEAR = 2017

export async function GET(request: NextRequest) {
  const currentYear = new Date().getFullYear()
  
  const today4am = new Date()
  today4am.setHours(4, 0, 0, 0)
  
  let sitemapEntries = ''
  
  // Add yearly sitemaps
  for (let year = START_YEAR; year <= currentYear; year++) {
    const lastModified = year === currentYear 
      ? today4am.toISOString().split('T')[0]
      : new Date(Date.UTC(year, 11, 31)).toISOString().split('T')[0]
    
    sitemapEntries += `
      <sitemap>
        <loc>${BASE_URL}/api/${year}/sitemap</loc>
        <lastmod>${lastModified}</lastmod>
      </sitemap>`
  }

  // Add yearly news sitemaps
  for (let year = START_YEAR; year <= currentYear; year++) {
    const lastModified = year === currentYear 
      ? today4am.toISOString().split('T')[0]
      : new Date(Date.UTC(year, 11, 31)).toISOString().split('T')[0]
    
    sitemapEntries += `
      <sitemap>
        <loc>${BASE_URL}/api/${year}/news-sitemap</loc>
        <lastmod>${lastModified}</lastmod>
      </sitemap>`
  }

  // Add profile sitemap
  sitemapEntries += `
      <sitemap>
        <loc>${BASE_URL}/api/profile-sitemap</loc>
        <lastmod>${today4am.toISOString().split('T')[0]}</lastmod>
      </sitemap>`

  const xml = /* XML */ `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}
    </sitemapindex>
  `

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
} 