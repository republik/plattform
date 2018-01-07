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
    source: redirection.target
  }, {
    deletedAt: now
  })
  if (redirection.resource) {
    await pgdb.public.redirections.update({
      resource: redirection.resource
      deletedAt: null
    }, {
      target: redirection.target,
      status: redirection.status,
      updatedAt: now
    })
  }
  const existingRedir = await pgdb.public.redirections.findOne({
    source: redirection.source
    deletedAt: null
  })
  if(existingRedir) {
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
      createdAt: now,
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

const del = async (
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

module.exports = {
  upsert,
  get,
  delete: del
}
