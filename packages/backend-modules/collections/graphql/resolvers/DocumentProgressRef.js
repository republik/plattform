const Collection = require('../../lib/Collection')

// Same as DocumentProgress.js: `getItemMax` returns the nested `data.max`
// snapshot when one exists, else the item itself — either way it keeps the
// row's "repoId"/"sanityId", so the nested ref stays resolvable.
module.exports = {
  max: (item) => {
    const max = Collection.getItemMax(item)
    return max
      ? {
          ...max,
          id: `max-${max.id}`,
        }
      : null
  },
}
