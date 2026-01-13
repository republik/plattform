require('@orbiting/backend-modules-env').config()

import moment from 'moment'
import Promise from 'bluebird'
import Debug from 'debug'

import { ConnectionContext } from '@orbiting/backend-modules-types'

const { parse: mdastParse } = require('@orbiting/remark-preset')
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const { maybeDeclareMilestonePublished } = require('../lib/postgres')
const { maybeApplyAudioSourceDuration } = require('../lib/audioSource')

const debug = Debug('publikator:script:migrateAudioSources')

const applicationName = 'backends publikator script migrateAudioSources'

const author = { name: 'Publikator Bot', email: 'tech@republik.ch' }

const handleBatch = async (rows: any[], count: number, pgdb: any) => {
  debug('handleBatch begin. rows: %i', rows?.length)

  await Promise.mapSeries(rows, async (row) => {
    const { repoId, archivedAt } = row
    debug(
      'repoId: %s (%s)',
      repoId,
      `https://publikator.republik.ch/repo/${repoId}/tree`,
    )

    if (archivedAt) {
      debug('repo archived. done')
      console.log(
        'repo archived',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )
      return
    }

    const publication = await pgdb.publikator.milestones.findOne({
      repoId,
      scope: 'publication',
      'publishedAt !=': null,
      revokedAt: null,
    })
    debug('publication: %s', publication?.id)

    const isPublished = !!publication
    debug('isPublished: %o', isPublished)

    const publicationCommit =
      isPublished &&
      (await pgdb.publikator.commits.findOne({ id: publication.commitId }))
    debug('publicationCommit: %s', publicationCommit?.id)

    const latestCommit = await pgdb.publikator.commits.findOne(
      { repoId },
      { orderBy: { createdAt: 'DESC' }, limit: 1 },
    )
    debug('latestCommit: %s', latestCommit?.id)

    const hasDuration = !!latestCommit?.meta?.audioSourceDurationMs
    debug('hasDuration: %o', hasDuration)
    if (hasDuration) {
      debug('meta.hasDuration present. done')
      console.log(
        'meta.hasDuration present',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )
      return
    }

    const workingCommit = publicationCommit || latestCommit
    debug('workingCommit: %s', workingCommit?.id)

    const { meta, type, content, content__markdown } = workingCommit

    const hasAudioSourceMp3 = !!meta.audioSourceMp3
    if (!hasAudioSourceMp3) {
      debug('meta.hasAudioSourceMp3 not present. done')
      console.log(
        'meta.hasAudioSourceMp3 not present',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )
      return
    }

    const hasAudioSourceDurationMs = !!meta.audioSourceDurationMs
    if (hasAudioSourceDurationMs) {
      debug('meta.audioSourceDurationMs present. done')
      console.log(
        'meta.audioSourceDurationMs present. done',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )
      return
    }

    await maybeApplyAudioSourceDuration(meta)

    const tx = await pgdb.transactionBegin()
    debug('transaction begin')

    try {
      const commit = await tx.publikator.commits.insertAndGet({
        repoId,
        content: content || mdastParse(content__markdown),
        type: type || 'mdast',
        meta,
        message: 'Audio-Datei vermessen',
        author,
        ...(workingCommit && { parentIds: [workingCommit.id] }),
        createdAt: moment(workingCommit.createdAt).add(1, 'second'),
      })
      debug('inserted commit: %s', commit.id)
      console.log(
        'inserted commit',
        repoId,
        `https://publikator.republik.ch/repo/${repoId}/tree`,
      )

      if (isPublished) {
        const latestDerivative = await tx.publikator.derivatives.findOne(
          {
            commitId: workingCommit.id,
            status: 'Ready',
          },
          { orderBy: { readyAt: 'DESC' }, limit: 1 },
        )

        if (latestDerivative) {
          delete latestDerivative.id
          const derivative = await tx.publikator.derivatives.insertAndGet({
            ...latestDerivative,
            commitId: commit.id,
          })
          debug('inserted derivative: %s', derivative.id)
          console.log(
            'inserted derivative',
            repoId,
            `https://publikator.republik.ch/repo/${repoId}/tree`,
          )
        }

        const now = moment()
        const versionName = `v${+publication.name.replace(/\D/g, '') + 1}`
        const milestone = await tx.publikator.milestones.insertAndGet({
          repoId,
          commitId: commit.id,
          name: versionName,
          meta: { script: 'migrationAudioSource' },
          author,
          scope: 'publication',
          scheduledAt: now,
          publishedAt: now,
        })
        debug('inserted milestone: %s (%s)', milestone.id, versionName)

        await maybeDeclareMilestonePublished(milestone, tx)

        console.log(
          'inserted milestone',
          repoId,
          `https://publikator.republik.ch/repo/${repoId}/tree`,
        )
      }

      await tx.transactionCommit()

      debug('transaction committed')
    } catch (e: any) {
      await tx.transactionRollback()
      debug('transaction rollback: %s', e?.message)
      throw e
    }
  })

  debug('handleBatch done. %i rows processed', count)
}

ConnectionContext.create(applicationName)
  .then(async (context: ConnectionContext) => {
    const { pgdb } = context

    debug('Begin')

    await pgdb
      .queryInBatches(
        { handleFn: handleBatch, size: 10 },
        `SELECT id "repoId", "archivedAt"
        FROM publikator.repos
        ORDER BY RANDOM()
        `,
      )
      .catch((e: Error) => {
        debug('Error while queryInBatches: %s', e.message)
        console.error(e)
      })

    debug('Done')

    return context
  })
  .then((context: ConnectionContext) => ConnectionContext.close(context))
  .finally(() => process.exit())
