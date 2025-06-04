const { BaseWorker } = require('@orbiting/backend-modules-job-queue')

class CockpitWorker extends BaseWorker {
  constructor(pgboss, context) {
    super(pgboss, context)
    this.queue = 'cockpit:refresh'
  }

  async perform(_) {
    await this.context.pgdb.query(`
      REFRESH MATERIALIZED VIEW cockpit_membership_evolution;
      REFRESH MATERIALIZED VIEW cockpit_membership_last_seen;
      REFRESH MATERIALIZED VIEW cockpit_discussions_evolution;
      REFRESH MATERIALIZED VIEW cockpit_collections_evolution;
    `)
  }
}

module.exports = {
  CockpitWorker,
}
