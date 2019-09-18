module.exports = {
  buckets (aggregation, args, context) {
    const buckets = []

    Object.keys(aggregation.buckets).forEach(value => {
      buckets.push({
        value,
        cards: aggregation.buckets[value]
      })
    })

    return buckets
  }
}
