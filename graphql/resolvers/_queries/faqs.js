module.exports = async (_, args, {pgdb}) => {
  const data = await pgdb.public.gsheets.findOneFieldOnly({name: 'faqs'}, 'data')
  if (!data) {
    return []
  }
  return data.filter(d => d.published)
}
