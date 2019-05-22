const { shuffle } = require('d3-array')
const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb }) => {
  const data = await pgdb.public.gsheets.findOneFieldOnly({ name: 'employees' }, 'data')
  if (!data) {
    return []
  }
  let result = data.filter(d => d.published)

  if (args.shuffle) {
    const randomOrder = shuffle(result)
    const boosted = shuffle([
      randomOrder.find(d => d.famous && d.gender === 'f'),
      randomOrder.find(d => d.famous && d.gender === 'm')
    ])
    const rest = randomOrder.filter(d => !boosted.includes(d))

    result = [
      boosted[0],
      rest[0],
      boosted[1]
    ].concat(rest.slice(1))
      .filter(Boolean)
      .filter((a, i, all) => all.findIndex(b => b.userId === a.userId) === i)
      .slice(0, args.shuffle)
  }

  const userIds = result
    .map(e => e.userId)
    .filter(Boolean)

  const users = await pgdb.public.users.find({
    id: userIds
  })
    .then(result => result
      .map(transformUser)
    )

  return result.map(d => ({
    ...d,
    user: users.find(u => u.id === d.userId)
  }))
}
