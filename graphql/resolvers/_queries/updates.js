module.exports = async (_, args, {pgdb}) => {
  const data = await pgdb.public.gsheets.findOneFieldOnly({name: 'updates'}, 'data')
  if (!data) {
    return []
  }
  const now = new Date()
  return data
    .filter(d => (new Date(d.publishedDateTime) < now))
    .sort((a, b) => new Date(b.publishedDateTime) - new Date(a.publishedDateTime))
}
