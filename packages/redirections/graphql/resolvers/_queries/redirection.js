module.exports = async (
  _,
  { path },
  { pgdb }
) => {
  return pgdb.public.redirections.findOne({
    source: path
  })
}
