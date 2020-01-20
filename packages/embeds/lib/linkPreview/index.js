const fetch = require('isomorphic-unfetch')
const getUrls = require('get-urls')
const cheerio = require('cheerio')
const moment = require('moment')
const debug = require('debug')('linkPreview')

const TTL_DB_ENTRIES_SECS = 6 * 60 * 60 // 6h
const MAX_REQUEST_URL_EACH_SECS = 30
const REDIS_PREFIX = 'embeds:linkPreview:throttle'

const getLinkPreviewUrlFromText = (text) => {
  const urls = [...getUrls(text)]
  return urls[urls.length - 1]
}

const getBaseUrl = (url) => {
  const parsedUrl = new URL(url)
  return `${parsedUrl.protocol}//${parsedUrl.hostname}`
}

const getContentForUrl = async (url) => {
  const response = await fetch(
    url,
    { method: 'GET' }
  )
    .then(res => res.text())
    .catch(error => {
      debug('Error getting preview with url %s %o', url, error)
      return null
    })

  const $ = cheerio.load(response)
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
  const baseUrl = getBaseUrl(url)
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
            obj.icon = new URL(href, baseUrl)
          }
        }
      }
      if (rel === 'shortcut icon') {
        obj[rel] = new URL(href, baseUrl)
      }
    }
  })

  const title = obj['og:title'] || $('title').text()

  if (!title) {
    return
  }

  return {
    title: title,
    description: obj['og:description'],
    imageUrl: obj['og:image'],
    siteName: obj['og:site_name'] || new URL(url).hostname,
    siteImageUrl: obj.icon || obj['shortcut icon']
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
  getLinkPreviewByUrl
}
