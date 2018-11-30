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

module.exports = {
  wasSent,
  saveSent
}
