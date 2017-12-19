module.exports = {
  async reward (packageOption, args, {pgdb}) {
    return Promise.all([
      pgdb.public.goodies.find({rewardId: packageOption.rewardId}),
      pgdb.public.membershipTypes.find({rewardId: packageOption.rewardId})
    ]).then((arr) => {
      return arr[0].concat(arr[1])[0]
    })
  }
}
