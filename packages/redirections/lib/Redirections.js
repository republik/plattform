const debug = require('debug')('rediretions:lib:Redirections')

const DEFAULT_ROLES = ['editor', 'admin']

const upsert = async (
  redirection,
  { pgdb },
  now = new Date()
) => {
  if (
    redirection.source === null || redirection.source === undefined ||
    redirection.target === null || redirection.target === undefined
  ) {
    throw new Error('neither redirection source nor target must be null')
  }
  // in case of A -> B -> A remove A -> B and only keep B -> A
  await pgdb.public.redirections.update({
    target: redirection.source,
    source: redirection.target,
    deletedAt: null
  }, {
    deletedAt: now
  })
  if (redirection.resource) {
    await pgdb.public.redirections.update({
      resource: redirection.resource,
      deletedAt: null
    }, {
      target: redirection.target,
      status: redirection.status,
      updatedAt: now
    })
  }
  const existingRedir = await pgdb.public.redirections.findOne({
    source: redirection.source,
    deletedAt: null
  })
  if (existingRedir) {
    return pgdb.public.redirections.update({
      source: redirection.source
    }, {
      ...redirection,
      updatedAt: now
    })
  } else {
    return pgdb.public.redirections.insert({
      ...redirection,
      updatedAt: now,
      createdAt: now
    })
  }
}

// notResource: get a redirection that does not match resource partial
const get = async (
  source,
  notResource,
  { pgdb }
) => {
  return pgdb.query(`
    SELECT
      *
    FROM
      redirections
    WHERE
      source = :source
      ${notResource ? 'AND NOT (resource @> :notResource)' : ''}
      AND "deletedAt" IS NULL
  `, {
    source,
    ...notResource
      ? { notResource }
      : { }
  })
}

const deleteBySource = async (
  source,
  { pgdb },
  now = new Date()
) => {
  return pgdb.public.redirections.updateAndGet(
    {
      source
    },
    {
      deletedAt: now
    }
  )
}

const add = async (args, pgdb) => {
  const now = new Date()
  const defaults = {
    status: 302,
    keepQuery: false,
    resource: null,
    createdAt: now,
    updatedAt: now
  }
  const redirection = { ...defaults, ...args }
  const transaction = await pgdb.transactionBegin()

  try {
    const exists = !!(await transaction.public.redirections.count({
      source: redirection.source,
      deletedAt: null
    }))

    if (exists) {
      throw new Error('Redirection exists already.')
    }

    validateSource(redirection.source)
    validateTarget(redirection.target)
    validateStatus(redirection.status)

    const result = await transaction.public.redirections.insertAndGet(redirection)

    await transaction.transactionCommit()

    return result
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { source: redirection.source, target: redirection.target })

    throw e
  }
}

const update = async (args, pgdb) => {
  const now = new Date()
  const defaults = {
    status: 302,
    keepQuery: false,
    resource: null,
    updatedAt: now
  }
  const redirection = { ...defaults, ...args }
  const conditions = { id: redirection.id, deletedAt: null }
  const transaction = await pgdb.transactionBegin()

  try {
    const exists = !!(await transaction.public.redirections.count(conditions))

    if (!exists) {
      throw new Error('Redirection does not exist.')
    }

    if (redirection.source) {
      validateSource(redirection.source)

      const sibling = !!(await transaction.public.redirections.count({
        source: redirection.source,
        deletedAt: null,
        'id !=': redirection.id
      }))

      if (sibling) {
        throw new Error(`Another Redirection with source "${redirection.source}" exists.`)
      }
    }

    if (redirection.target) {
      validateTarget(redirection.target)
    }

    if (redirection.status) {
      validateStatus(redirection.status)
    }

    const result = await transaction.public.redirections.updateAndGetOne(conditions, redirection)

    await transaction.transactionCommit()

    return result
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { redirection })

    throw e
  }
}

const deleteById = async ({ id }, pgdb) => {
  const conditions = { id, deletedAt: null }
  const transaction = await pgdb.transactionBegin()

  try {
    const exists = !!(await transaction.public.redirections.count(conditions))

    if (!exists) {
      throw new Error('Redirection does not exist.')
    }

    const isUpdated = !!(await transaction.public.redirections.update(conditions, { deletedAt: new Date() }))

    await transaction.transactionCommit()

    return isUpdated
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { id })

    throw e
  }
}

const findAll = async (pgdb) =>
  pgdb.public.redirections.find(
    { deletedAt: null },
    { orderBy: { createdAt: 'desc' } }
  )

const validateSource = (source) => {
  const base = process.env.FRONTEND_BASE_URL || 'http://localhost'
  const sourceUrl = new URL(source, base)

  if (![source, encodeURI(source)].includes(sourceUrl.pathname)) {
    throw new Error(`source "${source}" is invalid.`)
  }
}

const validateTarget = (target) => {
  const base = process.env.FRONTEND_BASE_URL || 'http://localhost'
  const targetUrl = new URL(target, base)

  if (![target, encodeURI(target)].includes(targetUrl.toString().replace(base, ''))) {
    throw new Error(`target "${target}" is invalid.`)
  }
}

const validateStatus = (status) => {
  if (![301, 302].includes(status)) {
    throw new Error(`status "${status}" is invalid.`)
  }
}

module.exports = {
  upsert,
  add,
  update,
  deleteById,
  deleteBySource,
  delete: deleteBySource,
  get,
  findAll,
  validateSource,
  validateTarget,
  validateStatus,
  DEFAULT_ROLES
}
