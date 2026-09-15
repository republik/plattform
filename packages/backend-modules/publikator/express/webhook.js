const bodyParser = require('body-parser')

// SANITY_SYNC (transition period, removable — see
// packages/backend-modules/sanity/lib/publikatorSync/index.ts)
const {
  isSyncFromPublikatorEnabled,
  enqueueSyncFromPublikator,
} = require('@orbiting/backend-modules-sanity')

// await middleware(server, pgdb, t, redis, createGraphqlContext())
module.exports = (server, pgdb, t, redis, context) => {
  // Callback for assets which are ready
  server.post(
    '/publikator/webhook/syntheticReadAloud',
    bodyParser.json(),
    async (req, res) => {
      const { pgdb, loaders } = context
      const { body } = req
      const {
        derivativeId,
        error,
        s3,
        duration: audioDuration,
        id: huebschId,
      } = body

      res.status(200).json({ ok: true })

      const derivative = await pgdb.publikator.derivatives.updateAndGetOne(
        {
          id: derivativeId,
        },
        {
          status: error ? 'Failure' : 'Ready',
          result: (error && { error }) || {
            audioDuration,
            s3,
            externalId: huebschId,
          },
          updatedAt: new Date(),
          ...(!error && { readyAt: new Date() }),
          ...(error && { failedAt: new Date() }),
        },
      )

      // @TODO: This might go into seperate lib.
      // Near duplicate of mutation generateDerivative
      if (derivative) {
        const commit = await loaders.Commit.byId.load(derivative.commitId)

        await context.pubsub.publish('repoChange', {
          repoChange: {
            repoId: commit.repoId,
            mutation: 'UPDATED',
            commit,
          },
        })

        // Generation is async against this old TTS server, so at the time
        // of the original commit/publish sync this derivative was still
        // Pending — articleDoc.ts's mirror had no audio to link yet
        // (see ./legacyAudio.ts). Now that it's actually ready, re-sync so
        // that audio reaches the Sanity mirror without waiting on some
        // unrelated future edit.
        //
        // The response was already sent above (fire-and-forget from the
        // caller's perspective) — try/catch here isn't optional the way it
        // might look: enqueueSyncFromPublikator only guards its own
        // Queue.send() internally, not this block's own milestones lookup,
        // and an uncaught rejection this far past the response has nothing
        // to reject to.
        if (!error && isSyncFromPublikatorEnabled()) {
          try {
            // Refreshes the draft mirror unconditionally -- a no-op unless
            // this derivative's commit is still the latest one (the 'commit'
            // action always re-derives "latest", same as every other sync).
            await enqueueSyncFromPublikator({
              repoId: commit.repoId,
              action: 'commit',
            })

            // Only refresh the *published* mirror if this derivative's
            // commit is still the currently live publication -- otherwise
            // the article has been republished since this generation was
            // kicked off, and blindly re-syncing the old commitId would
            // overwrite newer live content with stale text. Same "current
            // publication" lookup already used by
            // script/migrateAudioSources.ts.
            const publication = await pgdb.publikator.milestones.findOne({
              repoId: commit.repoId,
              scope: 'publication',
              'publishedAt !=': null,
              revokedAt: null,
            })
            if (publication?.commitId === derivative.commitId) {
              await enqueueSyncFromPublikator({
                repoId: commit.repoId,
                commitId: derivative.commitId,
                action: 'publish',
              })
            }
          } catch (e) {
            console.error(
              'syntheticReadAloud webhook: failed to enqueue Sanity resync',
              e,
            )
          }
        }
      }
    },
  )
}
