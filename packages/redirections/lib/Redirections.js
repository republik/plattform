const upsert = async (
  redirection,
  { pgdb }
) => {
  const now = new Date()
  // in case of A -> B -> A remove A -> B and only keep B -> A
  await pgdb.public.redirections.delete({
    target: redirection.source,
    source: redirection.target
  })
  if (redirection.resource) {
    await pgdb.public.redirections.update({
      resource: redirection.resource
    }, {
      target: redirection.target,
      status: redirection.status,
      updatedAt: now
    })
  }
  const existingRedir = await pgdb.public.redirections.findOne({
    source: redirection.source
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

const get = async (
  source, resource,
  { pgdb }
) => {
  return pgdb.query(`
    SELECT
      *
    FROM
      redirections
    WHERE
      source = :source AND
      NOT (resource @> :resource)
  `, {
    source,
    resource
  })
}

module.exports = {
  upsert,
  get
}
