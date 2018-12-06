const debug = require('debug')('crowdfundings:lib:mailLog')

const wasSent = ({type, payload}, { pgdb }) => {
  // if a payload value is an array, change the key to `${key} &&`
  // to ensure that if a mail was sent for one array member,
  // it doesn't get sent again
  // This is done by the asumption that it's better to send less
  // emails than more.
  // https://pogi.readthedocs.io/en/latest/API/condition/
  const payloadConditions = Object.keys(payload)
    .map(key => {
      const value = payload[key]
      let condition
      if (Array.isArray(value)) {
        condition = { [`${key} &&`]: value }
      } else {
        condition = { [key]: value }
      }
      return condition
    })
    .reduce(
      (agg, cur) => ({ ...agg, ...cur }),
      {}
    )
  pgdb.public.mailLog.count({
    type,
    payload: payloadConditions
  })
    .then(count => count > 0)
}

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
