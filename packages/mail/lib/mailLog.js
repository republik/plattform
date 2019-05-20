const debug = require('debug')('crowdfundings:lib:mailLog')

const wasSent = (onceFor, { pgdb }) => {
  const conditions = Object.keys(onceFor)
    .filter(key => ['type', 'userId', 'keys'].includes(key))
    // if a onceFor value is an array, change the key to `${key} &&`
    // to ensure that if a mail was sent for one array member,
    // it doesn't get sent again
    // This is done by the asumption that it's better to send less
    // emails than more.
    // https://pogi.readthedocs.io/en/latest/API/condition/
    .map(key => {
      const value = onceFor[key]
      let condition
      if (Array.isArray(value)) {
        condition = { [`${key} &&`]: value }
      } else {
        condition = { [`${key}`]: value }
      }
      return condition
    })
    .reduce(
      (agg, cur) => Object.assign(agg, cur),
      {}
    )
  return pgdb.public.mailLog.count({
    ...conditions,
    status: 'SENT'
  })
    .then(count => count > 0)
}

const insert = (payload, { pgdb }) =>
  pgdb.public.mailLog.insertAndGet(
    payload,
    { skipUndefined: true }
  )

const update = (match, payload, { pgdb }) =>
  pgdb.public.mailLog.update(
    match,
    payload,
    { skipUndefined: true }
  )

const send = async ({
  log,
  log: {
    logMessage = true,
    onceFor = false
  } = {},
  sendFunc,
  message,
  email,
  template,
  context
}) => {
  if (!sendFunc || !message || !email || !context || !context.pgdb) {
    throw new Error('missing input', { sendFunc, message, email, context })
  }

  if (onceFor) {
    if (await wasSent(onceFor, context)) {
      debug('not sending (was sent already): %o', log)
      return
    }
  }

  const info = {}

  if (log) {
    Object.assign(info, log.info)
  }

  if (template) {
    info.template = template
  }

  if (logMessage) {
    info.message = message
  }

  debug('sending... %o %o\n----', log, message)
  const logEntry = await insert(
    {
      type: (onceFor && onceFor.type) || template || 'no-template',
      userId: (onceFor && onceFor.userId) || info.userId || undefined,
      keys: (onceFor && onceFor.keys) || undefined,
      status: 'SENDING',
      email,
      info
    },
    context
  )

  const { result, status, error } = await sendFunc()

  await update(
    { id: logEntry.id },
    {
      result,
      status,
      error
    },
    context
  )

  return { result, status, error }
}

module.exports = {
  send
}
