/**
 * Set of function to handle queries to mailbox index in ElasticSearch
 */
const { getIndexAlias } = require('@orbiting/backend-modules-search/lib/utils')
const { getAddress, getAddresses } = require('./common')

const replaceCharset = (string) =>
  string.replace(/charset=([A-Za-z0-9-]+)/g, 'charset=utf-8')

const toHtml = (text) => `
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body style="font-family: monospace, monospace;">
  ${text.replace(/\n/g, '<br>')}
</body>
</html>
`

const toBase64 = (string) => Buffer.from(string).toString('base64')

const createShouldEmail = (email) => ({
  bool: {
    should: [
      // in
      { term: { 'from.value.address.keyword': email } },
      // out
      { term: { 'to.value.address.keyword': email } },
      { term: { 'cc.value.address.keyword': email } },
      { term: { 'bcc.value.address.keyword': email } },
    ],
  },
})

const createMustNotMatchAll = () => ({
  bool: {
    must_not: { match_all: {} },
  },
})

const createQuery = ({ user = {}, filters = {} }, { after, before } = {}) => {
  const sort =
    (after?.date && { range: { date: { lt: after.date } } }) ||
    (before?.date && { range: { date: { gt: before.date } } })

  const mustUserEmail = user?.email && createShouldEmail(user.email)
  const mustHaveError = filters?.hasError && createMustNotMatchAll()
  const mustEmail = filters?.email && createShouldEmail(filters.email)

  return {
    bool: {
      must: [sort, mustUserEmail, mustHaveError, mustEmail].filter(Boolean),
    },
  }
}

const createSort = ({ after, before }) => [
  { date: (after && 'desc') || (before && 'asc') || 'desc' },
]

const toRecords = ({ _id, _source }) => ({
  id: _id,
  type: 'mailbox',
  template: null,
  date: _source.date,
  status: 'sent',
  error: null,
  from: getAddress(_source.from?.value?.[0]),
  to: getAddresses(_source.to?.value),
  cc: getAddresses(_source.cc?.value),
  bcc: getAddresses(_source.bcc?.value),
  subject: _source.subject,
  html:
    (_source.html && toBase64(replaceCharset(_source.html))) ||
    (_source.text && toBase64(toHtml(_source.text))),
  links: null,
})

const count = async ({ user, filters }, elastic) => {
  try {
    const { statusCode, body } = await elastic.search({
      index: getIndexAlias('mail', 'read'),
      body: {
        size: 0,
        track_total_hits: true,
        query: createQuery({ user, filters }),
      },
    })

    const total = (statusCode === 200 && body.hits.total) || 0
    const count = Number.isFinite(total.value) ? total.value : total

    return count
  } catch (e) {
    console.warn(e.message)
  }

  return 0
}

const find = async ({ user, size, filters }, { after, before }, elastic) => {
  try {
    const { statusCode, body } = await elastic.search({
      index: getIndexAlias('mail', 'read'),
      body: {
        size,
        query: createQuery({ user, filters }, { after, before }),
        sort: createSort({ after, before }),
        _source: [
          'html',
          'text',
          'subject',
          'date',
          'from.value',
          'to.value',
          'cc.value',
          'bcc.value',
        ],
      },
    })

    if (statusCode !== 200) {
      throw Error('query failed')
    }

    return body.hits.hits.map(toRecords)
  } catch (e) {
    console.warn(e.message)
  }

  return []
}

module.exports = {
  count,
  find,
}
