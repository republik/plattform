require('@orbiting/backend-modules-env').config()
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
require('bluebird')
  .props({
    pgdb: require('@orbiting/backend-modules-base/lib/PgDb').connect(),
    redis: Redis.connect(),
    t: require('@orbiting/backend-modules-translate').t,
  })
  .then(async (context) => {
    await require('./importPayments').importPayments(null, context)
    Redis.disconnect(context.redis)
    context.pgdb.close()
  })
