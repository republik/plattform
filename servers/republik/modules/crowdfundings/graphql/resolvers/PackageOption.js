const debug = require('debug')('crowdfundings:resolver:PackageOption')

module.exports = {
  async reward (packageOption, args, { pgdb }) {
    if (packageOption.reward) {
      debug('packageOption.reward present')
      return packageOption.reward
    }

    debug('packageOption.reward missing, querying')
    return Promise.all([
      pgdb.public.goodies.find({rewardId: packageOption.rewardId}),
      pgdb.public.membershipTypes.find({rewardId: packageOption.rewardId})
    ])
      .then((arr) => arr[0].concat(arr[1])[0])
  }
}
