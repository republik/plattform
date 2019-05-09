// https://spin.atomicobject.com/2018/05/15/extending-heroku-timeout-node/
const debug = require('debug')('base:keepalive')

const {
  RES_KEEPALIVE_MS = 15 * 1000, // 15s
  RES_KEEPALIVE_TIMEOUT_MS = 5 * 60 * 1000 // 5min
} = process.env

if (RES_KEEPALIVE_MS < 2000) {
  throw new Error(`keepalive: RES_KEEPALIVE_MS (${RES_KEEPALIVE_MS}) too small (min. 2000)`)
}
if (RES_KEEPALIVE_TIMEOUT_MS < 2 * RES_KEEPALIVE_MS) {
  throw new Error(`keepalive: RES_KEEPALIVE_TIMEOUT_MS (${RES_KEEPALIVE_TIMEOUT_MS}) too small (min. 2xRES_KEEPALIVE_MS)`)
}

module.exports = (req, res, next) => {
  let isFinished = false
  let isDataSent = false
  const startTime = new Date().getTime()

  const finish = () => {
    isFinished = true
  }

  res.once('finish', finish)
  res.once('end', finish)
  res.once('close', finish)

  res.on('data', (data) => {
    isDataSent = true
  })

  const waitAndSend = () => {
    setTimeout(() => {
      const now = new Date().getTime()
      if (
        !isFinished && !isDataSent &&
        now < startTime + RES_KEEPALIVE_TIMEOUT_MS
      ) {
        res.writeProcessing()
        debug('keepalive sent')

        // wait another RES_KEEPALIVE_MS
        waitAndSend()
      }
    }, RES_KEEPALIVE_MS)
  }

  waitAndSend()
  next()
}
