const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Promise = require('bluebird')

// TODO this is all total WIP
module.exports = async (_, args, context) => {
  const {
    req,
    pgdb,
    user: me
  } = context
  ensureSignedIn(req)

  const notifications = await pgdb.query(`
    SELECT
      n.*,
      jsonb_agg(e.*) as events
    FROM
      notifications n
    JOIN
      events e
      ON n."eventId" = e.id
    WHERE
      n."userId" = :userId
    GROUP BY
      n.id
  `, {
    userId: me.id
  })

  const nodes = await Promise.map(
    notifications,
    async (n) => {
      const event = n.events[0]
      const eventObject = await pgdb.public.comments.findOne({ id: event.objectId })
      return {
        ...n,
        eventObjectType: event.objectType,
        eventObject: {
          ...eventObject,
          __typename: 'Comment'
        }
      }
    }
  )

  return {
    hasNextPage: false,
    hasPreviousPage: false,
    totalCount: nodes.length,
    nodes
  }
}
