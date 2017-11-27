const crypto = require('crypto')
const {ascending} = require('d3-array')

module.exports = ({orderId, amount, userId}) => {
  const {FRONTEND_BASE_URL, PF_PSPID, PF_SHA_IN_SECRET} = process.env

  const params = [
    {
      key: 'PSPID',
      value: PF_PSPID
    },
    {
      key: 'ORDERID',
      value: orderId || ''
    },
    {
      key: 'AMOUNT',
      value: amount || ''
    },
    {
      key: 'CURRENCY',
      value: 'CHF'
    },
    {
      key: 'LANGUAGE',
      value: 'de_DE'
    },
    {
      key: 'PM',
      value: 'PostFinance Card'
    },
    {
      key: 'BRAND',
      value: 'PostFinance Card'
    },
    {
      key: 'ACCEPTURL',
      value: `${FRONTEND_BASE_URL}/pledge`
    },
    {
      key: 'EXCEPTIONURL',
      value: `${FRONTEND_BASE_URL}/pledge`
    },
    {
      key: 'DECLINEURL',
      value: `${FRONTEND_BASE_URL}/pledge`
    },
    {
      key: 'CANCELURL',
      value: `${FRONTEND_BASE_URL}/pledge`
    },
    {
      key: 'USERID',
      value: userId || ''
    }
  ]
  // ensure correct order for valid sha1
  params.sort((a, b) => ascending(a.key, b.key))

  const paramsString = params.map(param => (
    `${param.key}=${param.value}${PF_SHA_IN_SECRET}`
  )).join('')

  return crypto.createHash('sha1').update(paramsString).digest('hex').toUpperCase()
}
