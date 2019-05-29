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
      ${notResource
    ? 'AND NOT (resource @> :notResource)'
    : ''
}
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

  const exists = !!(await pgdb.public.redirections.count({
    source: redirection.source,
    deletedAt: null
  }))

  if (exists) {
    throw new Error('Redirection exists already.')
  }

  if (!isValidSource(redirection.source)) {
    throw new Error(`Redirection source "${redirection.source}" is invalid.`)
  }

  return pgdb.public.redirections.insertAndGet(redirection)
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

  const exists = !!(await pgdb.public.redirections.count(conditions))

  if (!exists) {
    throw new Error('Redirection does not exist.')
  }

  if (redirection.source) {
    if (!isValidSource(redirection.source)) {
      throw new Error(`Redirection source "${redirection.source}" is invalid.`)
    }

    const sibling = !!(await pgdb.public.redirections.count({
      source: redirection.source,
      deletedAt: null,
      'id !=': redirection.id
    }))

    if (sibling) {
      throw new Error(`Another Redirection with source "${redirection.source}" exists.`)
    }
  }

  return pgdb.public.redirections.updateAndGetOne(conditions, redirection)
}

const deleteById = async ({ id }, pgdb) => {
  const conditions = { id, deletedAt: null }
  const exists = !!(await pgdb.public.redirections.count(conditions))

  if (!exists) {
    throw new Error('Redirection does not exist.')
  }

  return !!(await pgdb.public.redirections.update(conditions, { deletedAt: new Date() }))
}

const findAll = async (limit, offset, pgdb) =>
  pgdb.public.redirections.find(
    { deletedAt: null },
    { limit, offset, orderBy: { createdAt: 'desc' } }
  )

const isValidSource = (source) => {
  try {
    const sourceUrl = new URL(source, process.env.FRONTEND_BASE_URL)
    return source === sourceUrl.pathname
  } catch (e) {
    return false
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
  isValidSource,
  DEFAULT_ROLES
}
