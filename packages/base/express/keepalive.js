// https://spin.atomicobject.com/2018/05/15/extending-heroku-timeout-node/
const debug = require('debug')('base:keepalive')

const {
  RES_KEEPALIVE_MS = 1000 * 15
} = process.env

module.exports = (req, res, next) => {
  const space = ' '
  let isFinished = false
  let isDataSent = false

  const finish = () => {
    isFinished = true
  }

  res.once('finish', finish)
  res.once('end', finish)
  res.once('close', finish)

  res.on('data', (data) => {
    // look for something other than our blank space to indicate that real
    // data is now being sent back to the client.
    if (data !== space) {
      isDataSent = true
    }
  })

  const waitAndSend = () => {
    setTimeout(() => {
      // if the response hasn't finished and hasn't sent any data back
      if (!isFinished && !isDataSent) {
        // need to write the headers if they haven't been sent yet.
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json')
          res.writeHead(202)
        }

        res.write(space)
        debug('keepalive sent')

        // wait another RES_KEEPALIVE_MS
        waitAndSend()
      }
    }, RES_KEEPALIVE_MS)
  }

  waitAndSend()
  next()
}
