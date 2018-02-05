const { descending } = require('d3-array')

module.exports = async (_, args, {pgdb}) => {
  const data = await pgdb.public.gsheets.findOneFieldOnly({name: 'events'}, 'data')
  if (!data) {
    return []
  }
  return data
    .filter(d => d.published)
    .sort((a, b) => descending(new Date(b.date), new Date(a.date)))
}
