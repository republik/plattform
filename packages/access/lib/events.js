const debug = require('debug')('access:lib:events')

const log = async (grant, event, pgdb) => {
  const eventAdded = await pgdb.public.accessEvents.insertAndGet({
    accessGrantId: grant.id,
    event
  })

  debug('event logged', eventAdded)

  return eventAdded
}

module.exports = {
  log
}
