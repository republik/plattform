module.exports = async (_, { id }, context) => {
  const { pgdb } = context

  const campaign = await pgdb.public.campaigns.findOne({ id: id })

  return campaign
}
