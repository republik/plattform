module.exports = async (_, args, {pgdb}) => {
  const data = await pgdb.public.gsheets.findOneFieldOnly({name: 'events'}, 'data')
  if (!data) {
    return []
  }
  return data
    .filter(d => d.published)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}
