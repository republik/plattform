const moment = require('moment')
const { createUrlPrefixer } = require('@orbiting/backend-modules-assets/lib/urlPrefixing')
const proxyUrl = createUrlPrefixer()
const Redlock = require('redlock')
const debug = require('debug')('embeds:lib:fetchAndStore')
const twitter = require('./twitter')
const linkPreview = require('./linkPreview')
const types = {
  TwitterEmbed: {
    ...twitter
  },
  LinkPreview: {
    ...linkPreview
  }
}

const { REQUEST_TIMEOUT_SECS } = linkPreview

const TTL_DB_ENTRIES_SECS = 6 * 60 * 60 // 6h
const MAX_REQUEST_URL_EACH_SECS = 30

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

const fetchContent = async (url, { t }) => {
  if (twitter.REGEX.test(url)) {
    const tweetId = twitter.REGEX.exec(url)[1]
    return {
      type: 'TwitterEmbed',
      content: await twitter.getTweetById(tweetId, t)
    }
  }
  return {
    type: 'LinkPreview',
    content: await linkPreview.getLinkPreviewByUrl(url)
  }
}

const proxyContent = (content, type) => {
  const newContent = {}
  for (const key of types[type].imageKeys) {
    newContent[key] = proxyUrl(content[key])
  }
  return {
    ...content,
    ...newContent
  }
}

const fetchEmbed = async ({ url, doUpdate = false }, context) => {
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

  const redisKey = `embeds:fetch:${url.toLowerCase()}`
  const lockKey = `locks:${redisKey}`

  const lock = await redlock(redis).lock(lockKey, LOCK_TTL_MS)
  try {
    const existingEmbed = await loaders.Embed.byUrl.load(url)
    if (!doUpdate && existingEmbed) {
      return existingEmbed
    }

    // throttle
    if (await redis.getAsync(redisKey)) {
      debug('throttle prevented url from beeing fetched %s', url)
      return null
    }
    await redis.setAsync(
      redisKey,
      1,
      'EX', MAX_REQUEST_URL_EACH_SECS
    )

    const { type, content } = await fetchContent(url, context)

    if (content) {
      let dbEntry
      if (!existingEmbed) {
        dbEntry = await pgdb.public.embeds.insertAndGet({
          url,
          host: new URL(url).hostname,
          type,
          contentId: content.id,
          content
        })
      } else {
        if (existingEmbed.type !== type) {
          throw new Error('type missmatch')
        }
        await pgdb.public.embeds.updateOne(
          { id: existingEmbed.id },
          {
            content,
            updatedAt: new Date()
          }
        )
      }
      await loaders.Embed.byUrl.clear(url)
      return dbEntry
    }
  } finally {
    await lock.unlock()
  }
}

const getEmbedByUrl = async (url, context) => {
  if (!url || !url.trim().length) {
    return null
  }

  const transformDBEntry = (dbEntry) => ({
    ...dbEntry,
    ...proxyContent(dbEntry.content, dbEntry.type),
    id: dbEntry.typeId || dbEntry.id,
    __typename: dbEntry.type
  })

  const {
    loaders
  } = context

  const embed = await loaders.Embed.byUrl.load(url)

  const now = moment()
  if (embed) {
    if (
      now.diff(moment(embed.updatedAt), 'seconds') > TTL_DB_ENTRIES_SECS
    ) {
      // no await -> done in background
      fetchEmbed({ url, doUpdate: true }, context)
    }
    return transformDBEntry(embed)
  }

  const dbEntry = await fetchEmbed({ url }, context)
  return dbEntry
    ? transformDBEntry(dbEntry)
    : null
}

module.exports = {
  getEmbedByUrl
}
