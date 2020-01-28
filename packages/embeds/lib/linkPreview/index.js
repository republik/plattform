const fetch = require('isomorphic-unfetch')
const getUrls = require('get-urls')
const cheerio = require('cheerio')
const moment = require('moment')
const debug = require('debug')('linkPreview')
const AbortController = require('abort-controller')
const { createUrlPrefixer } = require('@orbiting/backend-modules-assets/lib/urlPrefixing')
const proxyUrl = createUrlPrefixer()

const {
  LINK_PREVIEW_USER_AGENT
} = process.env

const REQUEST_TIMEOUT_SECS = 10
const TTL_DB_ENTRIES_SECS = 6 * 60 * 60 // 6h
const MAX_REQUEST_URL_EACH_SECS = 30
const REDIS_PREFIX = 'embeds:linkPreview:throttle'

const getLinkPreviewUrlFromText = (text) => {
  const urls = [
    ...getUrls(
      text,
      {
        stripWWW: false,
        sortQueryParameters: false
      }
    )
  ]
  return urls[urls.length - 1]
}

const clipUrlFromText = (content, url) => {
  if (!url || !content) {
    return content
  }
  const index = content.indexOf(url)
  if (index === 0) {
    return content.replace(url, '')
      .trim()
  }
  if (
    index === content.length - url.length ||
    index === content.length - url.length - 1 // trailing slash
  ) {
    return content.substring(0, index)
      .trim()
  }
  return content
}

const fetchWithTimeout = (url, method = 'GET') => {
  const controller = new AbortController()
  const timeout = setTimeout(
    () => { controller.abort() },
    REQUEST_TIMEOUT_SECS * 1000
  )

  return fetch(
    url,
    {
      method,
      signal: controller.signal,
      headers: {
        'User-Agent': LINK_PREVIEW_USER_AGENT
      }
    }
  )
    .catch(error => {
      if (error.name === 'AbortError') {
        debug('TimeoutError: request to: %s failed', url)
      } else {
        debug(error.toString())
      }
    })
    .finally(() => {
      clearTimeout(timeout)
    })
}

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
  let maxSize = 0
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
          if (size && size > maxSize) {
            maxSize = size
            obj.icon = new URL(href, baseUrl).toString()
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
  const faviconExists = await fetchWithTimeout(faviconUrl, 'HEAD')
    .then(res => res && res.status === 200)
  if (faviconExists) {
    return faviconUrl
  }

  // try meta data of origin
  const response = await fetchWithTimeout(baseUrl)
    .then(res => res && res.status === 200 && res.text())

  if (!response) {
    return
  }
  const obj = parseMetaAndLink(response, baseUrl)
  return obj.icon || obj['shortcut icon']
}

const getContentForUrl = async (url) => {
  const response = await fetchWithTimeout(url)
    .then(res => res && res.status === 200 && res.text())

  if (!response) {
    return
  }

  const baseUrl = new URL(url).origin
  const obj = parseMetaAndLink(response, baseUrl)

  if (!obj['og:title']) {
    return
  }

  const siteImage = obj.icon || obj['shortcut icon'] || await getSiteImage(url, baseUrl)
  const siteImageUrl = proxyUrl(siteImage)

  return {
    title: obj['og:title'],
    description: obj['og:description'],
    imageUrl: proxyUrl(obj['og:image']),
    imageAlt: obj['og:image:alt'],
    siteName: obj['og:site_name'] || new URL(url).hostname,
    siteImageUrl
  }
}

const transformDBEntry = (dbEntry) => ({
  ...dbEntry,
  ...dbEntry.content
})

const fetchLinkPreview = async ({ url, existingLinkPreview }, context) => {
  debug(
    'fetchLinkPreview url: %s existingLinkPreview: %s',
    url,
    !!existingLinkPreview
  )

  const {
    pgdb,
    redis,
    loaders
  } = context

  // throttle
  const redisKey = `${REDIS_PREFIX}:${url}`
  const throttled = await redis.getAsync(redisKey)
  if (throttled) {
    debug('throttle prevented url from beeing fetched %s', url)
    return null
  }
  redis.setAsync(
    redisKey,
    1,
    'EX', MAX_REQUEST_URL_EACH_SECS
  )

  const content = await getContentForUrl(url)

  if (content) {
    if (!existingLinkPreview) {
      const dbEntry = await pgdb.public.linkPreviews.insertAndGet({
        url,
        hostname: new URL(url).hostname,
        content
      })
      loaders.LinkPreview.byUrl.clear(url)
      return transformDBEntry(dbEntry)
    } else {
      await pgdb.public.linkPreviews.updateOne(
        { id: existingLinkPreview.id },
        {
          content,
          updatedAt: new Date()
        }
      )
      loaders.LinkPreview.byUrl.clear(url)
    }
  }
}

const getLinkPreviewByUrl = async (url, context) => {
  if (!url || !url.trim().length) {
    return null
  }

  const {
    loaders
  } = context

  const linkPreview = await loaders.LinkPreview.byUrl.load(url)

  const now = moment()
  if (linkPreview) {
    if (now.diff(moment(linkPreview.updatedAt), 'seconds') > TTL_DB_ENTRIES_SECS) {
      // no await -> done in background
      fetchLinkPreview({ url, existingLinkPreview: linkPreview }, context)
    }
    return transformDBEntry(linkPreview)
  }

  return fetchLinkPreview({ url }, context)
}

module.exports = {
  getLinkPreviewUrlFromText,
  clipUrlFromText,
  getLinkPreviewByUrl
}
