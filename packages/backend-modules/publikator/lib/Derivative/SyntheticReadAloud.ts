/// <reference lib="dom" />
import createDebug from 'debug'
import moment from 'moment'
import crypto from 'crypto'

import { GraphqlContext } from '@orbiting/backend-modules-types'
const {
  getParsedDocumentId,
} = require('@orbiting/backend-modules-search/lib/Documents')

import { Commit, DerivativeRow } from '../types'
import { associateReadAloudDerivativeWithCommit } from './associateReadAloudDerivativeWithCommit'

const {
  ASSETS_SERVER_BASE_URL,
  TTS_SERVER_BASE_URL,
  TTS_SIGNATURE_SECRET,
  PUBLIC_URL,
} = process.env

const debug = createDebug('publikator:lib:Derivative:SyntheticReadAloud')

export const canDerive = (meta: any) => {
  const isEnabledTemplate = [
    'article',
    'discussion',
    'editorialNewsletter',
    'page',
  ].includes(meta.template)

  const hasNoAudioSource =
    !meta.audioSourceMp3 && !meta.audioSourceAac && !meta.audioSourceOgg

  const shouldDeriveAudio = !meta.suppressSyntheticReadAloud

  return isEnabledTemplate && hasNoAudioSource && shouldDeriveAudio
}

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
  if (versionName === 'preview') {
    return preprocessedMeta
  }

  const commitWithSynthReadAloud =
    await context.pgdb.publikator.commitsWithSynthReadAloud.findOne({
      commitId: commitId,
    })

  const synthesizedAudio =
    !!commitWithSynthReadAloud &&
    (await context.loaders.Derivative.byId.load(
      commitWithSynthReadAloud.derivativeId,
    ))

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

export const onPublish = async ({
  document,
  commit,
  skipSynthAudioGeneration,
  pgdb,
  user,
}: {
  document: any
  commit: Commit
  skipSynthAudioGeneration: boolean
  pgdb: any
  user?: any
}) => {
  const handlerDebug = debug.extend('onPublish')

  if (document.content?.meta?.audioSource) {
    handlerDebug('meta.audioSource present. skipping synthesizing.')
    return
  }

  if (!canDerive(document.content?.meta)) {
    handlerDebug('can not derive synthetic read aloud. skipping synthesizing.')
    return
  }

  // if a successful derivative already exists for that commit, prioritise it
  const existingDerivative = await getExistingDerivativeForCommit(commit, pgdb)
  if (existingDerivative) {
    await associateReadAloudDerivativeWithCommit(
      existingDerivative,
      commit,
      pgdb,
    )
    return existingDerivative
  }

  if (skipSynthAudioGeneration) {
    // do not derive new audio for this publication, but take existing audio from commit published before
    handlerDebug(
      'should not derive synthetic read aloud for this publication, but instead use an existing version. skipping synthesizing.',
    )
    const repoId = document.repoId
    const latestPublishedDerivative: DerivativeRow = await pgdb.queryFirst(
      `SELECT d.*
        FROM publikator.derivatives d
        JOIN publikator.commits commits ON d."commitId" = commits.id
        JOIN publikator.repos repos ON repos.id = commits."repoId"
        JOIN publikator.milestones milestones ON commits.id = milestones."commitId"
        WHERE repos."currentPhase" in ('scheduled', 'published')
        AND milestones.scope = 'publication'
        AND d.status = 'Ready'
        AND d.type = 'SyntheticReadAloud'
        AND repos.id = :repoId
        ORDER BY milestones."createdAt" DESC;`,
      { repoId: repoId },
    )

    if (!latestPublishedDerivative) {
      console.error(
        'No previously published successful derivative available, not associating derivative with commit.',
      )
      return
    }

    await associateReadAloudDerivativeWithCommit(
      latestPublishedDerivative,
      commit,
      pgdb,
    )

    return
  }

  const newDerivative = await derive(document, { force: false }, pgdb, user)

  await associateReadAloudDerivativeWithCommit(newDerivative, commit, pgdb)

  return newDerivative
}

const getExistingDerivativeForCommit = async (commit: Commit, pgdb: any) => {
  try {
    const derivative = await pgdb.publikator.derivatives.findOne({
      commitId: commit.id,
      status: 'Ready',
      type: 'SyntheticReadAloud',
    })
    return derivative
  } catch (e) {
    console.error('Error while checking for existing derivative for commit: %s', e)
  }
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
    if (!document.content?.meta?.syntheticVoice) {
      handlerDebug('Synthetic Voice not set. Skipping synthesizing.', {
        userId: user.id,
      })

      const error = {
        message: 'Please select a voice to read the text.',
      }

      const derivative = await pgdb.publikator.derivatives.insertAndGet({
        commitId,
        type: 'SyntheticReadAloud',
        status: 'Failure',
        result: { error },
        userId: user.id,
        ...({
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

  const expireAt = moment().add(15, 'minutes')

  const body = {
    document,
    derivativeId: derivative.id,
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
