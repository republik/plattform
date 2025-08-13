const { BaseWorker } = require('@orbiting/backend-modules-job-queue')

class CockpitWorker extends BaseWorker {
  constructor(pgboss, logger, context) {
    super(pgboss, logger, context)
    this.queue = 'cockpit:refresh'
  }

  async perform(_) {
    return this.context.pgdb.run(`
      REFRESH MATERIALIZED VIEW CONCURRENTLY cockpit_membership_evolution;
      REFRESH MATERIALIZED VIEW CONCURRENTLY cockpit_membership_last_seen;
      REFRESH MATERIALIZED VIEW CONCURRENTLY cockpit_discussions_evolution;
      REFRESH MATERIALIZED VIEW CONCURRENTLY cockpit_collections_evolution;
    `)
  }
}

module.exports = {
  CockpitWorker,
}
