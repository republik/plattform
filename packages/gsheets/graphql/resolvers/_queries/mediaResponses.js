module.exports = async (_, args, {pgdb}) => {
  const data = await pgdb.public.gsheets.findOneFieldOnly({name: 'mediaResponses'}, 'data')
  if (!data) {
    return []
  }

  return data.filter(d => d.published)
}
