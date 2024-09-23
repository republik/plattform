const bodyParser = require('body-parser')

// await middleware(server, pgdb, t, redis, createGraphqlContext())
module.exports = (server, pgdb, t, redis, context) => {
  // Callback for assets which are ready
  server.post(
    '/publikator/webhook/syntheticReadAloud',
    bodyParser.json(),
    async (req, res) => {
      const { pgdb, loaders } = context
      const { body } = req
      const { derivativeId, error, s3 } = body
      // TODO: use
      //  https://github.com/republik/plattform/blob/b786c01da5385718af50f09807950208aff50c2c/packages/backend-modules/publikator/lib/audioSource.ts#L31
      const audioDuration = 400

      res.status(200).json({ ok: true })

      const derivative = await pgdb.publikator.derivatives.updateAndGetOne(
        {
          id: derivativeId,
          status: 'Pending',
        },
        {
          status: error ? 'Failure' : 'Ready',
          result: (error && { error }) || {
            audioDuration,
            s3,
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
      }
    },
  )
}
