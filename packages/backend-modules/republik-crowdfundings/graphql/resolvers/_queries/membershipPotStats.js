const { getAllStats } = require('../../../lib/membershipPot')

module.exports = async (_, args, context) => {
  const allStats = await getAllStats(context)
  return allStats[0]
}
