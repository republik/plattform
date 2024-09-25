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
      const { derivativeId, error, s3, duration: audioDuration, id: huebschId } = body

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
      }
    },
  )
}
