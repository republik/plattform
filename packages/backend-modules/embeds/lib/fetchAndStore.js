const moment = require('moment')
const Redlock = require('redlock')
const debug = require('debug')('embeds:lib:fetchAndStore')

const {
  createProxyUrlPrefixer,
} = require('@orbiting/backend-modules-assets/lib/urlPrefixing')
const proxyUrl = createProxyUrlPrefixer()

const embeds = [
  require('./twitter'),
  require('./vimeo'),
  require('./youtube'),
  require('./linkPreview'),
]
const types = embeds.map(({ TYPE }) => TYPE).filter(Boolean)

const REQUEST_TIMEOUT_SECS = 10
const MAX_NUM_REQUESTS = 3

const LOCK_TTL_MS = (MAX_NUM_REQUESTS + 1) * REQUEST_TIMEOUT_SECS * 1000
const LOCK_RETRY_DELAY_MS = 400
const LOCK_RETRY_JITTER_MS = 20
const LOCK_RETRY_COUNT = Math.ceil(LOCK_TTL_MS / LOCK_RETRY_DELAY_MS)

const NUM_BURST_TRYS = 3
const REFRESH_EMBEDS_AFTER_SECS = 60 * 60 * 24 * 7 // 7 days

const redlock = (redis) => {
  return new Redlock([redis], {
    retryCount: LOCK_RETRY_COUNT,
    retryDelay: LOCK_RETRY_DELAY_MS,
    retryJitter: LOCK_RETRY_JITTER_MS,
    driftFactor: 0.01,
  })
}

const fetchContent = async (url, { t }) => {
  debug(`fetching url: ${url}...`)

  // Test to find matching embed
  const embed = embeds.find(({ REGEX }) => !!REGEX.test(url))
  if (!embed) {
    throw new Error(`No embed matches ${url}.`)
  }

  const [, id] = url.match(embed.REGEX)

  return {
    type: embed.TYPE,
    content: await embed.get(id, t).catch(() => null),
  }
}

const applyProxyUrls = (content, type) => {
  const newContent = {}
  for (const key of embeds.find((e) => e.TYPE === type).imageKeys) {
    newContent[key] = proxyUrl(content[key])
  }
  return {
    ...content,
    ...newContent,
  }
}

const mustFetch = (embed, now) => {
  if (!embed) {
    return true
  }
  const { content, disappeared, updatedAt, nextTryMinDate } = embed
  if (
    (!content || disappeared) &&
    (!nextTryMinDate || moment(nextTryMinDate).isBefore(now))
  ) {
    return true
  }
  if (
    // refresh
    content &&
    !disappeared &&
    moment(updatedAt).add(REFRESH_EMBEDS_AFTER_SECS, 'seconds').isBefore(now)
  ) {
    return true
  }
  return false
}

const isValid = (embed) => embed && embed.content && !embed.disappeared

const fetchEmbed = async ({ url, forceRefetch = false }, context) => {
  const { pgdb, redis, loaders } = context

  const lockKey = `locks:embeds:fetch:${url}`

  const lock = await redlock(redis).lock(lockKey, LOCK_TTL_MS)
  try {
    const existingEmbed = await pgdb.public.embeds.findOne({ url })

    if (!mustFetch(existingEmbed) && !forceRefetch) {
      debug(`return early: someone else did good work (${url})`)
      return existingEmbed
    }

    const now = moment()
    const { type, content } = await fetchContent(url, context)

    if (!existingEmbed) {
      debug(`saving result of first try content: ${!!content} (${url})`)
      const result = await pgdb.public.embeds.insertAndGet({
        url,
        host: new URL(url).hostname,
        type,
        content,
        contentId: content ? content.id : null,
        firstContent: content,
        createdAt: now,
        updatedAt: now,
        numTries: content ? 0 : 1,
        nextTryMinDate: null,
        disappeared: false,
      })
      return result
    }

    if (content) {
      debug(`updating success (${url})`)
      const result = await pgdb.public.embeds.updateAndGetOne(
        { id: existingEmbed.id },
        {
          type,
          content,
          contentId: content.id,
          ...(existingEmbed.firstContent ? {} : { firstContent: content }),
          updatedAt: now,
          numTries: 0,
          nextTryMinDate: null,
          disappeared: false,
        },
      )
      return result
    }

    const numTry = existingEmbed.numTries + 1
    const tryInSecs =
      numTry <= NUM_BURST_TRYS ? 0.2 : Math.pow(numTry - NUM_BURST_TRYS, 3)
    const nextTryMinDate = moment(now).add(tryInSecs, 'second')
    const disappeared = !!existingEmbed.content
    debug(
      `updating no success try: ${numTry} next-try: ${tryInSecs}s ${nextTryMinDate.from(
        now,
      )} disappeared: ${disappeared} (${url})`,
    )
    const result = await pgdb.public.embeds.updateAndGetOne(
      { id: existingEmbed.id },
      {
        numTries: numTry,
        nextTryMinDate,
        disappeared,
      },
    )
    return result
  } finally {
    await loaders.Embed.byUrl.clear(url)
    await lock.unlock()
  }
}

const transformDBEntry = (dbEntry) => {
  const { id, url, contentId, content, updatedAt, type: __typename } = dbEntry

  const proxyfiedContent = applyProxyUrls(content, __typename)

  return {
    id: contentId || id,
    url,
    updatedAt,
    __typename,
    ...proxyfiedContent,
  }
}

const getEmbedByUrl = async (rawUrl, context, forceRefetch = false) => {
  if (!rawUrl) {
    return null
  }

  const url = new URL(rawUrl).toString()

  const embed = await context.loaders.Embed.byUrl.load(url)

  const now = moment()
  const doFetch = mustFetch(embed, now)
  if (isValid(embed) && !forceRefetch) {
    if (doFetch) {
      // no await -> done in background
      fetchEmbed({ url }, context)
    }
    return transformDBEntry(embed)
  }

  if (doFetch || forceRefetch) {
    return fetchEmbed({ url, forceRefetch }, context).then((embed) =>
      isValid(embed) ? transformDBEntry(embed) : null,
    )
  }

  return null
}

const getEmbedData = ({ id, embedType }, t) => {
  const embed = embeds.find(({ TYPE }) => TYPE === embedType)

  if (!embed) {
    throw new Error(`embedType ${embedType} unknown.`)
  }

  return embed.get(id, t)
}

const canGetEmbedType = (embedType) => types.includes(embedType)

module.exports = {
  getEmbedByUrl,
  getEmbedData,
  canGetEmbedType,
  applyProxyUrls,
}
