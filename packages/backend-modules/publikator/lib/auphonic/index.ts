import Debug from 'debug'
import { ConnectionContext } from '@orbiting/backend-modules-types'

const {
  getAudioCover,
} = require('@orbiting/backend-modules-documents/lib/meta')

const { updateRepo } = require('../postgres')

// @see https://auphonic.com/help/api/index.html
const AUPHONIC_ENDPOINT = 'https://auphonic.com/api'

const { AUPHONIC_BEARER, AUPHONIC_PRESET } = process.env

const debug = Debug('publikator:lib:auphonic')

type CallBody = {
  preset?: string
  metadata: {
    title: string
  }
  output_basename: string
  image?: string
  preset_cover_image?: string
}

type Data = {
  title: string
  image?: string
}

type Document = {
  content: {
    meta: {
      title: string
      willBeReadAloud?: boolean
    }
  }
  resolved: {
    meta: {
      format?: {
        meta: {
          title: string
        }
      }
    }
  }
}

// @see https://auphonic.com/api/info/production_status.json
enum AuphonicProductionStatus {
  FILE_UPLOAD = 0,
  WAITING = 1,
  ERROR = 2,
  DONE = 3,
  AUDIO_PROCESSING = 4,
  AUDIO_ENCODING = 5,
  OUTGOING_FILE_TRANSFER = 6,
  AUDIO_MONO_MIXDOWN = 7,
  SPLIT_AUDIO_ON_CHAPTER_MARKS = 8,
  INCOMPLETE = 9,
  PRODUCTION_NOT_STARTED_YET = 10,
  PRODUCTION_OUTDATED = 11,
  INCOMING_FILE_TRANSFER = 12,
  STOPPING_THE_PRODUCTION = 13,
  SPEECH_RECOGNITION = 14,
}

type AuphonicProduction = {
  data: {
    uuid: string
    status: AuphonicProductionStatus
  }
}

type AuphonicErrorPayload = {
  repoId?: string
  status?: number
  url?: string
}

const handleResponse = async (res: Response): Promise<AuphonicProduction> => {
  if (!res.ok) {
    throw new AuphonicError(res.statusText, {
      status: res.status,
      url: res.url,
    })
  }

  return res.json()
}

/**
 * Wrapper to call Auphonic API.
 */
const call = async (
  path: string,
  method: 'POST' | 'GET' = 'POST',
  body?: CallBody,
) => {
  const callDebug = debug.extend('call')
  callDebug('path: %s', path)
  callDebug('method: %s', method)
  callDebug('body: %o', body)

  const url = AUPHONIC_ENDPOINT + path
  callDebug('url: %s', url)

  const headers = {
    ...(AUPHONIC_BEARER ? { Authorization: AUPHONIC_BEARER } : {}),
    'Content-Type': 'application/json',
  }
  callDebug('headers: %o', headers)

  const init = {
    method,
    headers,
    body: JSON.stringify(body),
  }

  return fetch(url, init).then(handleResponse)
}

/**
 * Get a production
 */
export const get = async (id: string) => {
  const getDebug = debug.extend('get')
  getDebug('id: %s', id)

  const production = await call(`/production/${id}.json`, 'GET').catch(
    (error) => {
      if (error.constructor.name === 'AuphonicError') {
        getDebug('Error (swallowed): %s', error.message)
        return null
      }

      throw error
    },
  )
  getDebug('production: %o', production)

  return production
}

/**
 * Transform data to body which Auphonic API can work with.
 */
const toBody = (data: Data) => {
  const toBodyDebug = debug.extend('toBody')
  toBodyDebug('data: %o', data)

  const title = data.title.slice(0, 240) // slice, keep within usual filename length
  const outputBasename = `Republik, ${title}`.replace(/[^\p{L}\s\-–, ]/u, '') // strip unwanted chars
  const image = data.image

  const presetCoverImage = AUPHONIC_PRESET
    ? { preset_cover_image: AUPHONIC_PRESET }
    : {}

  const body = {
    metadata: {
      title,
    },
    // filename
    output_basename: outputBasename,
    // set image or, as fallback, use cover image from preset
    // @see https://auphonic.com/help/api/update.html?highlight=preset_cover#use-a-cover-image-from-a-preset
    ...(image ? { image } : presetCoverImage),
  }

  toBodyDebug('body: %o', body)

  return body
}

/**
 * Create a production, using provided data
 */
const create = async (data: Data) => {
  const createDebug = debug.extend('create')
  createDebug('data: %o', data)

  const production = await call('/productions.json', 'POST', {
    ...toBody(data),
    ...(AUPHONIC_PRESET ? { preset: AUPHONIC_PRESET } : {}),
  })
  createDebug('production: %o', production)

  return production
}

/**
 * Update a production, using provided data
 */
const update = async (id: string, data: Data) => {
  const updateDebug = debug.extend('update')
  updateDebug('id: %s', id)
  updateDebug('data: %o', data)

  const production = await call(`/production/${id}.json`, 'POST', {
    ...toBody(data),
  })
  updateDebug('production: %o', production)

  return production
}

/**
 * Upsert a production, using provided doc
 */
export const upsert = async (
  repoId: string,
  doc: Document,
  context: ConnectionContext,
) => {
  const upsertDebug = debug.extend('upsert')
  upsertDebug('repoId: %s', repoId)
  upsertDebug('doc: %o', doc)

  if (!AUPHONIC_BEARER) {
    upsertDebug('abort upsert: AUPHONIC_BEARER missing')
    return false
  }

  if (!doc.content.meta.willBeReadAloud) {
    upsertDebug('abort upsert: doc.content.meta.willBeReadAloud falsy')
    return false
  }

  const { pgdb } = context

  const repo = await pgdb.publikator.repos.findOne({ id: repoId })
  if (!repo) {
    throw new AuphonicError('repo not found', { repoId })
  }

  const { meta } = repo
  const audioCoverUrl = getAudioCover(
    { ...doc.content.meta, ...doc.resolved.meta },
    {
      properties: {
        height: 1400,
        width: 1400,
        format: 'jpeg',
        bg: 'white',
        postfix: '.jpeg',
      },
    },
  )

  const data = {
    title: [doc.resolved.meta.format?.meta.title, doc.content.meta.title]
      .filter(Boolean)
      .join(': '),
    image: audioCoverUrl,
  }
  upsertDebug('data: %o', data)

  const production = await get(meta.auphonicProductionId)
  if (!production) {
    upsertDebug('no production found. creating…')
    const production = await create(data)

    const id = production.data.uuid

    await updateRepo(repoId, { auphonicProductionId: id }, pgdb)

    return production
  }

  const id = production.data.uuid
  const status = production.data.status

  if (
    [
      AuphonicProductionStatus.INCOMPLETE,
      AuphonicProductionStatus.PRODUCTION_NOT_STARTED_YET,
    ].includes(status)
  ) {
    upsertDebug('production found (%s). updating…', id)

    return update(id, data)
  }

  upsertDebug(
    'production found (%s) but skipping due status (%i). ',
    id,
    status,
  )
}

/**
 * Upsert production. Swallows error
 *
 */
export const maybeUpsert = async (
  repoId: string,
  doc: Document,
  context: ConnectionContext,
) => upsert(repoId, doc, context).catch((e) => console.warn(e))

class AuphonicError extends Error {
  message: string
  payload?: AuphonicErrorPayload

  constructor(message: string, payload?: AuphonicErrorPayload) {
    super()
    this.name = 'AuphonicError'
    this.message = message

    if (payload) {
      this.payload = payload
    }
  }
}
