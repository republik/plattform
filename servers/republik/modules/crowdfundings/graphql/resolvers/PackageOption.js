const debug = require('debug')('crowdfundings:resolver:PackageOption')

module.exports = {
  async reward (packageOption, args, { pgdb }) {
    if (packageOption.reward) {
      debug('packageOption.reward present')
      return packageOption.reward
    }

    debug('packageOption.reward missing, querying')
    return Promise.all([
      pgdb.public.goodies.find({ rewardId: packageOption.rewardId }),
      pgdb.public.membershipTypes.find({ rewardId: packageOption.rewardId })
    ])
      .then((arr) => arr[0].concat(arr[1])[0])
  },
  async membership ({ membership, membershipId }, args, { pgdb }) {
    // no auth checks, as unauthorized users should not get Pledge.options
    if (membership) {
      return membership
    } else if (membershipId) {
      return pgdb.public.memberships.findOne({
        id: membershipId
      })
    }
  }
}
