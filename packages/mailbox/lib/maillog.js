/**
 * Set of function to handle queries to mailLob table in Postgres
 */
const moment = require('moment')
const { v4: isUuid } = require('is-uuid')

const { getAddress, getAddresses } = require('./common')

const getStatus = (row) =>
  row.mandrillLastEvent?.msg?.state ||
  row.result?.status ||
  row.status?.toLowerCase()

const getError = (row) =>
  row.mandrillLastEvent?.msg?.diag ||
  row.mandrillLastEvent?.msg?.bounce_description ||
  row.result?.reject_reason ||
  row.result?.error ||
  row.error?.message ||
  row.error?.meta?.error?.message ||
  row.error?.meta?.error?.type ||
  row.error?.meta?.response

const getLinks = (row) => {
  return [
    row.createdAt > moment().subtract(30, 'days') &&
      row.result?._id && {
        id: row.result._id,
        label: 'Content on Mandrill',
        url: [
          'https://mandrillapp.com/activity/content?id=',
          moment(row.createdAt).format('YYYYMMDD'),
          '_',
          row.result._id,
        ].join(''),
      },
  ].filter(Boolean)
}

const createCondition = (
  { user = {}, filters = {} },
  { after, before } = {},
) => {
  const sort =
    (after?.date && { 'createdAt <': after.date }) ||
    (before?.date && { 'createdAt >': before.date }) ||
    {}

  const mustUserIdOrEmail = user?.id &&
    user?.email && {
      or: [{ userId: user.id }, { userId: null, email: user.email }],
    }

  const mustId = filters?.id && { id: isUuid(filters.id) ? filters.id : null }

  const mustHaveError = filters?.hasError && {
    or: [
      { "\"mandrillLastEvent\"->'msg'->>'diag' !=": null },
      { "\"mandrillLastEvent\"->'msg'->>'bounce_description' !=": null },
      { "result->>'reject_reason' !=": null },
      { "result->>'error' !=": null },
      { "error->>'message' !=": null },
      { "error->'meta'->'error'->>'message' !=": null },
      { "error->'meta'->'error'->>'type' !=": null },
      { "error->'meta'->>'response' !=": null },
    ],
  }

  const mustEmail = filters?.email && { email: filters.email }

  const and = [mustUserIdOrEmail, mustId, mustHaveError, mustEmail].filter(
    Boolean,
  )

  return {
    ...sort,
    and,
  }
}

const createOrderBy = ({ after, before }) => ({
  createdAt: (after && 'desc') || (before && 'asc') || 'desc',
})

const toRecords = (row) => {
  const message = row.info?.message

  return {
    id: row.id,
    type: row.type,
    template: row.info?.template,
    date: row.createdAt.toISOString(),
    status: getStatus(row),
    error: getError(row),
    from:
      message?.from_name &&
      message?.from_email &&
      getAddress({
        name: message.from_name,
        address: message.from_email,
      }),
    to: row.email && getAddresses([{ address: row.email }]),
    cc: null,
    bcc: null,
    hasHtml: false,
    html: null,
    subject: message?.subject,
    links: getLinks(row),
  }
}

const count = async ({ user, filters }, pgdb) => {
  try {
    const count = await pgdb.public.mailLog.count(
      createCondition({ user, filters }),
    )

    return count
  } catch (e) {
    console.warn(e.message)
  }

  return 0
}

const find = async ({ user, size, filters }, { after, before }, pgdb) => {
  try {
    const nodes = await pgdb.public.mailLog.find(
      createCondition({ user, filters }, { after, before }),
      { orderBy: createOrderBy({ after, before }), limit: size },
    )

    return nodes.map(toRecords)
  } catch (e) {
    console.warn(e.message)
  }

  return []
}

module.exports = {
  count,
  find,
}
