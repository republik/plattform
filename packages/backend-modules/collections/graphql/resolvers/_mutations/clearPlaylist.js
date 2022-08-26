const clearCollection = require('./clearCollection')
const { getCollectionName } = require('../../../lib/Playlist')

module.exports = async (_, args, context) => {
  await clearCollection(null, { collectionName: getCollectionName() }, context)

  return []
}
