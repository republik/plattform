const Collection = require('../../lib/Collection')

module.exports = {
  max: item => {
    const max = Collection.getItemMax(item)
    return max
      ? {
        ...max,
        id: `max-${max.id}`
      }
      : null
  }
}
