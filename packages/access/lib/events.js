const debug = require('debug')('access:lib:events')

const log = async (grant, event, payload, pgdb) => {
  const eventAdded = await pgdb.public.accessEvents.insertAndGet({
    acessGrantId: grant.id,
    event,
    payload
  })

  debug('event logged', eventAdded)

  return eventAdded
}

module.exports = {
  log
}
