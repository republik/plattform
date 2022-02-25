import createDebug from 'debug'
import moment from 'moment'

import { GraphqlContext } from '@orbiting/backend-modules-types'
const {
  getParsedDocumentId,
} = require('@orbiting/backend-modules-search/lib/Documents')

import { DerivativeRow } from '../../loaders/Derivative'

const { ASSETS_SERVER_BASE_URL, TTS_SERVER_BASE_URL, PUBLIC_URL } = process.env

const debug = createDebug('publikator:lib:Derivative:SyntheticReadAloud')

export const canDerive = (template: string) =>
  ['article', 'discussion', 'editorialNewsletter', 'page'].includes(template)

export const processMeta = async (
  preprocessedMeta: any,
  document: any,
  context: GraphqlContext,
) => {
  if (preprocessedMeta.audioSource) {
    return preprocessedMeta
  }

  if (preprocessedMeta.suppressSyntheticReadAloud) {
    return preprocessedMeta
  }

  const { repoId, commitId, versionName } = getParsedDocumentId(document.id)
  if (versionName !== 'preview') {
    return preprocessedMeta
  }

  const derivatives: DerivativeRow[] =
    await context.loaders.Derivative.byCommitId.load(commitId)
  const synthesizedAudio = derivatives.find(
    (d) => d.type === 'SyntheticReadAloud' && d.status === 'Ready',
  )
  if (synthesizedAudio) {
    const { result } = synthesizedAudio
    if (!result) {
      return preprocessedMeta
    }

    const { audioDuration, s3 } = result
    if (!audioDuration || !s3) {
      return preprocessedMeta
    }

    const { key, bucket } = s3
    if (!key || !bucket) {
      return preprocessedMeta
    }

    preprocessedMeta.audioSource = {
      mediaId: Buffer.from([repoId, 'SyntheticReadAloud'].join('/')).toString(
        'base64',
      ),
      kind: 'syntheticReadAloud',
      mp3: `${ASSETS_SERVER_BASE_URL}/s3/${bucket}/${key}`,
      durationMs: Math.round(1000 * audioDuration),
    }
  }

  return preprocessedMeta
}

export const applyAssetsAudioUrl = (derivative: DerivativeRow) => {
  const { type, result } = derivative
  if (type !== 'SyntheticReadAloud') {
    return derivative
  }

  if (!result) {
    return derivative
  }

  const { audioDuration, s3 } = result
  if (!audioDuration || !s3) {
    return derivative
  }

  const { key, bucket } = s3
  if (!key || !bucket) {
    return derivative
  }

  return {
    ...derivative,
    result: {
      ...derivative.result,
      audioAssetsUrl: `${ASSETS_SERVER_BASE_URL}/s3/${bucket}/${key}`,
    },
  }
}

export const onPublish = async (document: any, context: GraphqlContext) => {
  const handlerDebug = debug.extend('onPublish')

  if (document.content?.meta?.audioSource) {
    handlerDebug('meta.audioSource present. skipping synthesizing.')
    return
  }

  if (!canDerive(document.content?.meta?.template)) {
    handlerDebug('can not derive synthetic read aloud. skipping synthesizing.')
    return
  }

  return derive(document, context)
}

export const derive = async (document: any, context: GraphqlContext) => {
  const handlerDebug = debug.extend('derive')

  if (!TTS_SERVER_BASE_URL) {
    handlerDebug('TTS_SERVER_BASE_URL not set. skipping synthesizing.')
    return
  }

  if (!PUBLIC_URL) {
    handlerDebug('PUBLIC_URL not set. skipping synthesizing.')
    return
  }

  const { commitId } = getParsedDocumentId(document.id)

  // @TODO: Loader?
  const derivatives = await context.pgdb.publikator.derivatives.find({
    commitId,
    type: 'SyntheticReadAloud',
    or: [
      {
        // Ready, and not destroyed
        'readyAt !=': null,
        destroyedAt: null,
      },
      {
        // Pending, and created not 15 minutes ago
        status: 'Pending',
        readyAt: null,
        'createdAt >=': moment().subtract(15, 'minutes'),
      },
    ],
  })

  if (derivatives.length) {
    handlerDebug('derviative found. skipping synthesizing.')

    return derivatives.slice(0, 1).pop()
  }

  const derivative = await context.pgdb.publikator.derivatives.insertAndGet({
    commitId,
    type: 'SyntheticReadAloud',
    status: 'Pending',
  })

  const substitutesUrl = ''
  const lexiconUrl = ''
  const webhookUrl = `${PUBLIC_URL}/publikator/webhook/syntheticReadAloud`
  const expireAt = new Date().toISOString

  const isOk = await fetch(`${TTS_SERVER_BASE_URL}/intake/document`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      document,
      derivativeId: derivative.id,
      substitutesUrl,
      lexiconUrl,
      webhookUrl,
      expireAt,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        handlerDebug(
          'unable to fetch reader intake URL (HTTP Status Code: $d)',
          res.status,
        )
        return false
      }

      handlerDebug('intake URL call %o', await res.json())

      return true
    })
    .catch((e) => {
      handlerDebug('unable to fetch reader intake URL: %s', e.message)
      return false
    })

  if (!isOk) {
    return context.pgdb.publikator.derivatives.updateAndGetOne(
      {
        id: derivative.id,
      },
      {
        status: 'Failure',
        updatedAt: new Date(),
        failedAt: new Date(),
      },
    )
  }

  return derivative
}
