module.exports = async (_, { id, token }, { pgdb }) => {
  const groups = await pgdb.public.gsheets.findOneFieldOnly(
    { name: 'cards/mockCardGroups' },
    'data'
  )

  const group = groups.find(group => group.id === id)

  if (!group) {
    throw new Error('api/cards/group/404')
  }

  return group
}
