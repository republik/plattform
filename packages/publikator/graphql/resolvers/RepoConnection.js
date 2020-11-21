const { getPhases } = require('../../lib/phases')

module.exports = {
  phases(obj, args, context) {
    const { t } = context

    return getPhases().map(phase => {
      const { key, color, lock } = phase
      const bucket = obj.aggregations.phases.buckets.find(bucket => bucket.key === phase.key)

      return {
        key,
        color,
        lock,
        count: bucket?.doc_count || 0,
      }
    })
  },
}
