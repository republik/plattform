const BASE_URL = process.env.PUBLIC_BASE_URL
const START_YEAR = 2017

function generateSiteMapIndex(years) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${years
  .map((year) => {
    return `
  <sitemap>
    <loc>${BASE_URL}/api/sitemap/${year}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  })
  .join('')}
</sitemapindex>`
}

function SiteMap() {
  // Next.js requirement: Page must export a default React component,
  // even when using getServerSideProps that handles the entire response
}

export async function getServerSideProps({ res }) {
  const currentYear = new Date().getFullYear()

  const years = []
  for (let year = START_YEAR; year <= currentYear; year++) {
    years.push(year)
  }

  const sitemap = generateSiteMapIndex(years)

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, max-age=86400') // Cache for 24 hours

  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
