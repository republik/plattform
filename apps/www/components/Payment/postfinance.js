import { ascending } from 'd3-array'
import { PUBLIC_BASE_URL, PF_PSPID } from '../../lib/constants'

export const getParams = ({ /* alias, */ userId, orderId, amount, sha }) => {
  const params = [
    {
      key: 'PSPID',
      value: PF_PSPID,
    },
    {
      key: 'ORDERID',
      value: orderId || '',
    },
    {
      key: 'AMOUNT',
      value: amount || '',
    },
    {
      key: 'CURRENCY',
      value: 'CHF',
    },
    {
      key: 'LANGUAGE',
      value: 'de_DE',
    },
    {
      key: 'PM',
      value: 'PostFinance Card',
    },
    {
      key: 'BRAND',
      value: 'PostFinance Card',
    },
    {
      key: 'ACCEPTURL',
      value: `${PUBLIC_BASE_URL}/angebote`,
    },
    {
      key: 'EXCEPTIONURL',
      value: `${PUBLIC_BASE_URL}/angebote`,
    },
    {
      key: 'DECLINEURL',
      value: `${PUBLIC_BASE_URL}/angebote`,
    },
    {
      key: 'CANCELURL',
      value: `${PUBLIC_BASE_URL}/angebote`,
    },
    // {
    //   key: 'ALIAS',
    //   value: alias || ''
    // },
    {
      key: 'USERID',
      value: userId || '',
    },
    // , {
    //   key: 'ALIASUSAGE',
    //   value: 'membership'
    // }
  ]
  // ensure correct order for valid sha1
  params.sort((a, b) => ascending(a.key, b.key))

  params.push({
    key: 'SHASIGN',
    value: sha,
  })

  return params
}
