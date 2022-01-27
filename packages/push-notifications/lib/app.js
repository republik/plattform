const { publish: publishFirebase } = require('./firebase')
const { publish: publishApn } = require('./apn')
const debug = require('debug')('notifications:publish')
const intersection = require('lodash/intersection')

const defaultTTL = 4 * 7 * 24 * 60 * 60 * 1000 // 4 weeks in ms, firebase default

const publish = async (userIds, args, { pgdb }) => {
  if (!args.ttl) {
    args.ttl = defaultTTL
  }

  const devices = await pgdb.public.devices.find({ userId: userIds })

  const iosTokens = devices
    .filter((d) => d.information.os === 'ios')
    .map((d) => d.token)

  const androidTokens = devices
    .filter((d) => d.information.os === 'android')
    .map((d) => d.token)

  debug(
    'sending notifications (apn: %d, firebase: %d)...',
    iosTokens.length,
    androidTokens.length,
  )
  return Promise.all([
    publishApn({ tokens: iosTokens, ...args }, pgdb),
    publishFirebase({ tokens: androidTokens, ...args }, pgdb),
  ]).then((results) => {
    const result = results.reduce(
      (agg, r) => {
        if (r && r.staleTokens) {
          agg.staleTokens = agg.staleTokens.concat(r.staleTokens)
          agg.goodTokens = agg.goodTokens.concat(r.goodTokens)
        }
        return agg
      },
      {
        staleTokens: [],
        goodTokens: [],
      },
    )
    return userIds.map((userId) => {
      const tokens = devices
        .filter((d) => d.userId === userId)
        .map((d) => d.token)
      return {
        userId,
        numSuccessful: intersection(result.goodTokens, tokens).length,
        numFailed: intersection(result.staleTokens, tokens).length,
      }
    })
  })
}

module.exports = {
  publish,
}
