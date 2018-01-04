const upsert = async (
  redirection,
  { pgdb }
) => {
  const now = new Date()
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

module.exports = {
  upsert
}
