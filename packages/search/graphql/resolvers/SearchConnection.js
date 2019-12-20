module.exports = {
  aggregations (obj, args) {
    if (args.keys && obj.aggregations) {
      return obj.aggregations.filter(agg => args.keys.includes(agg.key))
    }
    return obj.aggregations
  }
}
