const getUrls = require('get-urls')
const cheerio = require('cheerio')
const moment = require('moment')
const debug = require('debug')('linkPreview')
const { fetchWithTimeout } = require('@orbiting/backend-modules-utils')
const { createUrlPrefixer } = require('@orbiting/backend-modules-assets/lib/urlPrefixing')
const proxyUrl = createUrlPrefixer()
const Redlock = require('redlock')

const {
  LINK_PREVIEW_USER_AGENT
} = process.env

const REQUEST_TIMEOUT_SECS = 10
const TTL_DB_ENTRIES_SECS = 6 * 60 * 60 // 6h
const MAX_REQUEST_URL_EACH_SECS = 30
const REDIS_PREFIX = 'embeds:linkPreview:throttle'

const LOCK_RETRY_DELAY_MS = 600
const LOCK_RETRY_COUNT = Math.ceil(
  3 * ((REQUEST_TIMEOUT_SECS * 1000) / LOCK_RETRY_DELAY_MS)
)
const LOCK_TTL_MS = LOCK_RETRY_COUNT * LOCK_RETRY_DELAY_MS

const redlock = (redis) => {
  return new Redlock(
    [redis],
    {
      retryCount: LOCK_RETRY_COUNT,
      retryDelay: LOCK_RETRY_DELAY_MS
    }
  )
}

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
  if (
    content.length === url.length ||
    content.length === (url.length + 1)
  ) {
    return ''
  }
  return content
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

const getContentForUrl = async (url) => {
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

  const siteImage =
    obj['shortcut icon'] ||
    obj.iconSmall ||
    await getSiteImage(url, baseUrl)

  return {
    title: obj['og:title'],
    description: obj['og:description'],
    imageUrl: proxyUrl(obj['og:image']),
    imageAlt: obj['og:image:alt'],
    siteName: obj['og:site_name'] || new URL(url).hostname,
    siteImageUrl: siteImage ? proxyUrl(siteImage) : null
  }
}

const fetchLinkPreview = async ({ url, doUpdate = false }, context) => {
  debug(
    'fetchLinkPreview url: %s doUpdate: %s',
    url,
    doUpdate
  )

  const {
    pgdb,
    redis,
    loaders
  } = context

  const redisKey = `${REDIS_PREFIX}:${url.toLowerCase()}`
  const lockKey = `locks:${redisKey}`

  const lock = await redlock(redis).lock(lockKey, LOCK_TTL_MS)
  try {
    const existingLinkPreview = await loaders.LinkPreview.byUrl.load(url)
    if (!doUpdate && existingLinkPreview) {
      return existingLinkPreview
    }

    // throttle
    const throttled = await redis.getAsync(redisKey)
    if (throttled) {
      debug('throttle prevented url from beeing fetched %s', url)
      return null
    }
    await redis.setAsync(
      redisKey,
      1,
      'EX', MAX_REQUEST_URL_EACH_SECS
    )

    const content = await getContentForUrl(url)

    if (content) {
      let dbEntry
      if (!existingLinkPreview) {
        dbEntry = await pgdb.public.linkPreviews.insertAndGet({
          url,
          hostname: new URL(url).hostname,
          content
        })
      } else {
        await pgdb.public.linkPreviews.updateOne(
          { id: existingLinkPreview.id },
          {
            content,
            updatedAt: new Date()
          }
        )
      }
      await loaders.LinkPreview.byUrl.clear(url)
      return dbEntry
    }
  } finally {
    await lock.unlock()
  }
}

const getLinkPreviewByUrl = async (url, context) => {
  if (!url || !url.trim().length) {
    return null
  }

  const transformDBEntry = (dbEntry) => ({
    ...dbEntry,
    ...dbEntry.content
  })

  const {
    loaders
  } = context

  const linkPreview = await loaders.LinkPreview.byUrl.load(url)

  const now = moment()
  if (linkPreview) {
    if (
      now.diff(moment(linkPreview.updatedAt), 'seconds') > TTL_DB_ENTRIES_SECS
    ) {
      // no await -> done in background
      fetchLinkPreview({ url, doUpdate: true }, context)
    }
    return transformDBEntry(linkPreview)
  }

  const dbEntry = await fetchLinkPreview({ url }, context)
  return dbEntry
    ? transformDBEntry(dbEntry)
    : null
}

module.exports = {
  getLinkPreviewUrlFromText,
  clipUrlFromText,
  getLinkPreviewByUrl
}
