const { descending } = require('d3-array')

module.exports = async (_, args, {pgdb}) => {
  const data = await pgdb.public.gsheets.findOneFieldOnly({name: 'updates'}, 'data')
  if (!data) {
    return []
  }
  const now = new Date()
  return data
    .filter(d => (new Date(d.publishedDateTime) < now))
    .sort((a, b) => descending(new Date(a.publishedDateTime), new Date(b.publishedDateTime)))
}
