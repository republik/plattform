const cheerio = require('cheerio')
const { fetchWithTimeout } = require('@orbiting/backend-modules-utils')

const {
  LINK_PREVIEW_USER_AGENT
} = process.env

const REQUEST_TIMEOUT_SECS = 10
const MAX_NUM_REQUESTS = 3

const fetch = (url, method = 'GET') => fetchWithTimeout(
  url,
  {
    method,
    headers: {
      'User-Agent': LINK_PREVIEW_USER_AGENT
    },
    timeoutSecs: REQUEST_TIMEOUT_SECS
  }
)

const parseMetaAndLink = (html, baseUrl) => {
  const $ = cheerio.load(html)
  const meta = $('meta')
  const obj = {}
  Object.keys(meta).forEach(key => {
    const { attribs } = meta[key] || {}
    if (attribs !== undefined) {
      if (attribs.property && attribs.content) {
        obj[attribs.property] = attribs.content
      }
      if (attribs.name && attribs.content) {
        obj[attribs.name] = attribs.content
      }
    }
  })

  // add biggest icon and favicon to obj
  const link = $('link')
  let minSize = Number.MAX_SAFE_INTEGER
  Object.keys(link).forEach(key => {
    const { attribs } = meta[key] || {}
    if (
      attribs !== undefined &&
      attribs.rel &&
      attribs.href
    ) {
      const { rel, href, sizes } = attribs
      if (rel.indexOf('icon') > 0 && sizes) {
        const size = parseInt(sizes.split('x')[0])
        if (size && size < minSize) {
          minSize = size
          obj.iconSmall = new URL(href, baseUrl).toString()
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

  const { origin: baseUrl, hostname } = new URL(url)
  const obj = parseMetaAndLink(response, baseUrl)

  if (!obj['og:title']) {
    return
  }

  return {
    title: obj['og:title'],
    description: obj['og:description'],
    imageUrl: obj['og:image'],
    imageAlt: obj['og:image:alt'],
    siteName: obj['og:site_name'] || hostname,
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
  REQUEST_TIMEOUT_SECS,
  MAX_NUM_REQUESTS
}
