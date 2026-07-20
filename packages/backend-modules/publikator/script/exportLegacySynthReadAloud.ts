require('@orbiting/backend-modules-env').config()

import fs from 'fs'
import Debug from 'debug'

const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const debug = Debug('publikator:script:exportLegacySynthReadAloud')

const { ASSETS_SERVER_BASE_URL } = process.env

const OUTPUT_PATH =
  process.argv[2] || 'legacy-synth-read-aloud.json'

/**
 * One-off export for the Sanity `backfill-legacy-synthetic-audio` migration.
 *
 * For every repo, resolves the `SyntheticReadAloud` derivative tied to its
 * current (non-revoked) publication milestone and dumps the info needed to
 * reconstruct the old audio URL — `${ASSETS_SERVER_BASE_URL}/s3/{bucket}/{key}`
 * — since that URL was only ever computed at read-time (see
 * lib/Derivative/SyntheticReadAloud.ts#processMeta), never persisted anywhere.
 */
const QUERY = `
  SELECT DISTINCT ON (repos.id)
    repos.id AS "repoId",
    derivatives.id AS "derivativeId",
    derivatives.result AS "result",
    derivatives."readyAt" AS "readyAt"
  FROM publikator.repos repos
  JOIN publikator.milestones milestones
    ON milestones."repoId" = repos.id
   AND milestones.scope = 'publication'
   AND milestones."publishedAt" IS NOT NULL
   AND milestones."revokedAt" IS NULL
  JOIN publikator."commitsWithSynthReadAloud" cwsra
    ON cwsra."commitId" = milestones."commitId"
  JOIN publikator.derivatives derivatives
    ON derivatives.id = cwsra."derivativeId"
  WHERE derivatives.status = 'Ready'
    AND derivatives.type = 'SyntheticReadAloud'
    AND (derivatives.result -> 's3' ->> 'bucket') IS NOT NULL
    AND (derivatives.result -> 's3' ->> 'key') IS NOT NULL
    AND (derivatives.result ->> 'audioDuration') IS NOT NULL
  ORDER BY repos.id, milestones."publishedAt" DESC
`

ConnectionContext.create('backends publikator script exportLegacySynthReadAloud')
  .then(async (context: any) => {
    const { pgdb } = context

    if (!ASSETS_SERVER_BASE_URL) {
      throw new Error('ASSETS_SERVER_BASE_URL not set')
    }

    debug('Begin')

    const rows = await pgdb.query(QUERY)
    debug('found %i rows', rows.length)

    const entries = rows.map((row: any) => {
      const { repoId, derivativeId, result, readyAt } = row
      const { bucket, key } = result.s3
      const audioDuration = result.audioDuration

      return {
        repoId,
        derivativeId,
        url: `${ASSETS_SERVER_BASE_URL}/s3/${bucket}/${key}`,
        durationMs: Math.round(1000 * audioDuration),
        generatedAt: readyAt,
      }
    })

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, 2))
    debug('wrote %i entries to %s', entries.length, OUTPUT_PATH)

    return context
  })
  .then((context: any) => ConnectionContext.close(context))
  .finally(() => process.exit())
