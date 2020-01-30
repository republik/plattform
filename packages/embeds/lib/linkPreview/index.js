const cheerio = require('cheerio')
const { fetchWithTimeout } = require('@orbiting/backend-modules-utils')

const {
  LINK_PREVIEW_USER_AGENT
} = process.env

const REQUEST_TIMEOUT_SECS = 10

const fetch = (url, method = 'GET') => fetchWithTimeout(
  url,
  {
    method,
    headers: {
      'User-Agent': LINK_PREVIEW_USER_AGENT
    }
  },
  REQUEST_TIMEOUT_SECS
)

const parseMetaAndLink = (html, baseUrl) => {
  const $ = cheerio.load(html)
  const meta = $('meta')
  const obj = {}
  Object.keys(meta).forEach(key => {
    if (meta[key].attribs !== undefined) {
      if (meta[key].attribs.property && meta[key].attribs.content) {
        obj[meta[key].attribs.property] = meta[key].attribs.content
      }
      if (meta[key].attribs.name && meta[key].attribs.content) {
        obj[meta[key].attribs.name] = meta[key].attribs.content
      }
    }
  })

  // add biggest icon and favicon to obj
  const link = $('link')
  let minSize = Number.MAX_SAFE_INTEGER
  Object.keys(link).forEach(key => {
    if (
      link[key].attribs !== undefined &&
      link[key].attribs.rel &&
      link[key].attribs.href
    ) {
      const rel = link[key].attribs.rel
      const href = link[key].attribs.href
      if (rel.indexOf('icon') > 0) {
        const sizes = link[key].attribs.sizes
        if (sizes) {
          const size = parseInt(sizes.split('x')[0])
          if (size && size < minSize) {
            minSize = size
            obj.iconSmall = new URL(href, baseUrl).toString()
          }
        }
      }
      if (rel === 'shortcut icon') {
        obj[rel] = new URL(href, baseUrl).toString()
      }
    }
  })

  if (!obj['og:title']) {
    obj['og:title'] = $('title').text()
  }

  return obj
}

const getSiteImage = async (url, baseUrl) => {
  // try well-known favicon
  const faviconUrl = `${baseUrl}/favicon.ico`
  const faviconExists = await fetch(faviconUrl, 'HEAD')
    .then(res => res && res.status === 200)
  if (faviconExists) {
    return faviconUrl
  }

  // try meta data of origin
  const response = await fetch(baseUrl)
    .then(res => res && res.status === 200 && res.text())

  if (!response) {
    return
  }
  const obj = parseMetaAndLink(response, baseUrl)
  return obj['shortcut icon'] || obj.iconSmall
}

const getLinkPreviewByUrl = async (url) => {
  const response = await fetch(url)
    .then(res => res && res.status === 200 && res.text())

  if (!response) {
    return
  }

  const baseUrl = new URL(url).origin
  const obj = parseMetaAndLink(response, baseUrl)

  if (!obj['og:title']) {
    return
  }

  return {
    title: obj['og:title'],
    description: obj['og:description'],
    imageUrl: obj['og:image'],
    imageAlt: obj['og:image:alt'],
    siteName: obj['og:site_name'] || new URL(url).hostname,
    siteImageUrl: (
      obj['shortcut icon'] ||
      obj.iconSmall ||
      await getSiteImage(url, baseUrl)
    )
  }
}

module.exports = {
  getLinkPreviewByUrl,
  imageKeys: ['siteImageUrl', 'imageUrl'],
  REQUEST_TIMEOUT_SECS
}
