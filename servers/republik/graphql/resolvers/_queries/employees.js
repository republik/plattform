const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, {pgdb}) => {
  const data = await pgdb.public.gsheets.findOneFieldOnly({name: 'employees'}, 'data')
  if (!data) {
    return []
  }
  const publishedData = data
    .filter(d => d.published)

  const userIds = publishedData
    .map(e => e.userId)
    .filter(Boolean)

  const users = await pgdb.public.users.find({
    id: userIds
  })
    .then(result => result
      .map(transformUser)
    )

  return publishedData.map(d => ({
    ...d,
    user: users.find(u => u.id === d.userId)
  }))
}
