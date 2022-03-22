import createDebug from 'debug'
import moment from 'moment'
import crypto from 'crypto'

import { GraphqlContext } from '@orbiting/backend-modules-types'
const {
  getParsedDocumentId,
} = require('@orbiting/backend-modules-search/lib/Documents')
const {
  Roles: { userIsInRoles },
} = require('@orbiting/backend-modules-auth')

import { DerivativeRow } from '../../loaders/Derivative'

const {
  DOCUMENTS_RESTRICT_TO_ROLES,
  ASSETS_SERVER_BASE_URL,
  TTS_SERVER_BASE_URL,
  TTS_SIGNATURE_SECRET,
  PUBLIC_URL,
} = process.env

const debug = createDebug('publikator:lib:Derivative:SyntheticReadAloud')

const documentsRestrictToRoles = DOCUMENTS_RESTRICT_TO_ROLES?.split(',')

export const canDerive = (template: string) =>
  ['article', 'discussion', 'editorialNewsletter', 'page'].includes(template)

export const processMeta = async (
  preprocessedMeta: any,
  document: any,
  context: GraphqlContext,
) => {
  if (!userIsInRoles(context.user, documentsRestrictToRoles)) {
    return preprocessedMeta
  }

  // Feature only visible to users w/ editor or tester.audio role during test-run
  if (!userIsInRoles(context.user, ['editor', 'tester.audio'])) {
    return preprocessedMeta
  }

  if (preprocessedMeta.audioSource) {
    return preprocessedMeta
  }

  if (preprocessedMeta.suppressSyntheticReadAloud) {
    return preprocessedMeta
  }

  const { repoId, commitId, versionName } = getParsedDocumentId(document.id)
  if (versionName === 'preview') {
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

export const onPublish = async (document: any, pgdb: any, user?: any) => {
  const handlerDebug = debug.extend('onPublish')

  if (document.content?.meta?.audioSource) {
    handlerDebug('meta.audioSource present. skipping synthesizing.')
    return
  }

  if (!canDerive(document.content?.meta?.template)) {
    handlerDebug('can not derive synthetic read aloud. skipping synthesizing.')
    return
  }

  return derive(document, { force: false }, pgdb, user)
}

interface DeriveOptions {
  force: boolean
}

export const derive = async (
  document: any,
  options: DeriveOptions,
  pgdb: any,
  user?: any,
) => {
  const handlerDebug = debug.extend('derive')

  if (!TTS_SERVER_BASE_URL) {
    handlerDebug('TTS_SERVER_BASE_URL not set. skipping synthesizing.')
    return
  }

  if (!TTS_SIGNATURE_SECRET) {
    handlerDebug('TTS_SIGNATURE_SECRET not set. skipping synthesizing.')
    return
  }

  if (!PUBLIC_URL) {
    handlerDebug('PUBLIC_URL not set. skipping synthesizing.')
    return
  }

  const { commitId } = getParsedDocumentId(document.id)

  if (user) {
    const pendingCount = await pgdb.publikator.derivatives.count({
      status: 'Pending',
      readyAt: null,
      'createdAt >=': moment().subtract(15, 'minutes'),
      userId: user.id,
    })

    if (pendingCount > 1) {
      handlerDebug('too many pending derivatives. skipping synthesizing.', {
        userId: user.id,
      })

      const error = {
        message: 'too many pending derivatives',
      }

      const derivative = await pgdb.publikator.derivatives.insertAndGet({
        commitId,
        type: 'SyntheticReadAloud',
        status: 'Failure',
        result: { error },
        userId: user?.id,
        ...(user && {
          author: {
            name: user.name,
            email: user.email,
          },
        }),
        updatedAt: new Date(),
        failedAt: new Date(),
      })

      return derivative
    }
  }

  const { force } = options

  const derivatives = await pgdb.publikator.derivatives.find({
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

  if (!force && derivatives.length) {
    handlerDebug('derviative found. skipping synthesizing.')

    return derivatives.slice(0, 1).pop()
  }

  const derivative = await pgdb.publikator.derivatives.insertAndGet({
    commitId,
    type: 'SyntheticReadAloud',
    status: 'Pending',
    userId: user?.id,
    ...(user && {
      author: {
        name: user.name,
        email: user.email,
      },
    }),
  })

  const syntheticReadAloudSubstitution =
    await pgdb.public.gsheets.findOneFieldOnly(
      { name: 'syntheticReadAloudSubstitution' },
      'data',
    )

  const substitutionUrl = syntheticReadAloudSubstitution
    ? `${PUBLIC_URL}/publikator/syntheticReadAloud/substitution`
    : ''

  const syntheticReadAloudLexicon = await pgdb.public.gsheets.findOneFieldOnly(
    { name: 'syntheticReadAloudLexicon' },
    'data',
  )

  const lexiconUrl = syntheticReadAloudLexicon
    ? `${PUBLIC_URL}/publikator/syntheticReadAloud/lexicon`
    : ''
  const webhookUrl = `${PUBLIC_URL}/publikator/webhook/syntheticReadAloud`
  const expireAt = moment().add(15, 'minutes')

  const body = {
    document,
    derivativeId: derivative.id,
    substitutionUrl,
    lexiconUrl,
    webhookUrl,
    expireAt,
  }

  const signature = crypto
    .createHmac('sha256', TTS_SIGNATURE_SECRET)
    .update(Buffer.from(JSON.stringify(body), 'utf-8'))
    .digest('hex')

  handlerDebug('body with signature: %o', {
    ...body,
    signature,
  })

  const endpoint = `${TTS_SERVER_BASE_URL}/intake/document`
  const posting = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...body,
      signature,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const { status, statusText } = res
        handlerDebug(
          'unable to fetch reader intake URL (HTTP Status Code: $d)',
          status,
        )
        return {
          ok: false,
          error: {
            message: 'unable to fetch reader intake URL',
            payload: { endpoint, status, statusText },
          },
        }
      }

      handlerDebug('intake URL call %o', await res.json())

      return { ok: true }
    })
    .catch((e) => {
      handlerDebug('unable to fetch reader intake URL: %s', e.message)
      return {
        ok: false,
        error: {
          message: e.message,
          payload: { endpoint },
        },
      }
    })

  if (posting?.error) {
    const { error } = posting
    return pgdb.publikator.derivatives.updateAndGetOne(
      {
        id: derivative.id,
      },
      {
        status: 'Failure',
        result: { error },
        updatedAt: new Date(),
        failedAt: new Date(),
      },
    )
  }

  return derivative
}
