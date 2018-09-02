const debug = require('debug')('access:lib:events')

const log = async (grant, event, pgdb) => {
  const eventAdded = await pgdb.public.accessEvents.insertAndGet({
    accessGrantId: grant.id,
    event
  })

  debug('event logged', eventAdded)

  return eventAdded
}

const findByGrant = (grant, pgdb) => {
  debug('findByGrant')
  return pgdb.public.accessEvents.find(
    { accessGrantId: grant.id },
    { orderBy: { createdAt: 'desc' } }
  )
}

module.exports = {
  log,
  findByGrant
}
