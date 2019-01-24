module.exports = async (_, args, {pgdb}) => {
  const data = await pgdb.public.gsheets.findOneFieldOnly({name: 'reports'}, 'data')
  if (!data) {
    return []
  }
  const publishedData = data.filter(d => d.published)

  return publishedData
}
