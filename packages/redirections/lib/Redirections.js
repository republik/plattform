const upsert = async (
  redirection
, {
  pgdb
}) => {
  const existingRedir = await pgdb.public.redirections.findOne({
    source: redirection.source
  })
  if(existingRedir) {
    return pgdb.public.redirections.update({
      source: redirection.source
    },
      redirection
    )
  } else {
    return pgdb.public.redirections.insert(redirection)
  }
}

module.exports = {
  upsert
}
