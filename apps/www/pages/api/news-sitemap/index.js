const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://www.republik.ch'
const START_YEAR = 2017

function generateNewsSiteMapIndex(years) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${years
  .map((year) => {
    return `
  <sitemap>
    <loc>${BASE_URL}/api/news-sitemap/${year}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  })
  .join('')}
</sitemapindex>`
}

export default async function handler(req, res) {
  const currentYear = new Date().getFullYear()
  
  const years = []
  for (let year = START_YEAR; year <= currentYear; year++) {
    years.push(year)
  }

  const sitemap = generateNewsSiteMapIndex(years)

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, max-age=86400') // Cache for 24 hours
  
  res.write(sitemap)
  res.end()
} 