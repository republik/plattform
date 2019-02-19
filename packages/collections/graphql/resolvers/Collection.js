const Collection = require('../../lib/Collection')
const { paginate } = require('@orbiting/backend-modules-utils')

module.exports = {
  id ({ id, userId }) {
    return `${id}${userId ? '_' + userId : ''}`
  },
  async items ({ id, userId }, args, context) {
    if (!userId) {
      return []
    }
    const items = await Collection.findDocumentItems(
      {
        collectionId: id,
        userId
      },
      context
    )
    return paginate(args, items)
  }
}
