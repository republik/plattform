// https://spin.atomicobject.com/2018/05/15/extending-heroku-timeout-node/
const debug = require('debug')('base:keepalive')

const {
  RES_KEEPALIVE_MS = 1000 * 15
} = process.env

module.exports = (req, res, next) => {
  const space = ' '
  let isFinished = false
  let isDataSent = false

  res.once('finish', () => {
    isFinished = true
  })

  res.once('end', () => {
    isFinished = true
  })

  res.once('close', () => {
    isFinished = true
  })

  res.on('data', (data) => {
    // Look for something other than our blank space to indicate that real
    // data is now being sent back to the client.
    if (data !== space) {
      isDataSent = true
    }
  })

  const waitAndSend = () => {
    setTimeout(() => {
      // If the response hasn't finished and hasn't sent any data back....
      if (!isFinished && !isDataSent) {
        // Need to write the status code/headers if they haven't been sent yet.
        if (!res.headersSent) {
          res.writeHead(202)
        }

        res.write(space)
        debug('sent keepalive')

        // Wait another TIMEOUT_MS
        waitAndSend()
      }
    }, RES_KEEPALIVE_MS)
  }

  waitAndSend()
  next()
}
