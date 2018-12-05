const debug = require('debug')('crowdfundings:lib:mailLog')

const wasSent = ({type, payload}, { pgdb }) =>
  pgdb.public.mailLog.count({
    type,
    payload
  })
    .then(count => count > 0)

const saveSent = ({ type, payload, resultOk, resultPayload }, { pgdb }) => {
  pgdb.public.mailLog.insert({
    type,
    payload,
    resultOk,
    resultPayload
  })
}

const send = async (log, sendFunc, context) => {
  if (await wasSent(log, context)) {
    debug('not sending (was sent already): %o', log)
  } else {
    debug('sending... %o', log)
    const results = await sendFunc()
    if (results && results[0]) {
      const result = results[0]
      await saveSent({
        ...log,
        resultOk: result.status === 'sent' && !result.reject_reason,
        resultPayload: result
      }, context)
      return result
    }
  }
}

module.exports = {
  send
}
