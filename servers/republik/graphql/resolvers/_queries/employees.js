const { shuffle } = require('d3-array')
const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb }) => {
  const employees = await pgdb.public.gsheets.findOneFieldOnly({ name: 'employees' }, 'data')
  if (!employees) {
    return []
  }
  let result = employees.filter(e => e.published)

  if (args.withGreeting) {
    result = result.filter(d => d.greeting)
  }

  if (args.shuffle) {
    const shuffledEmployees = shuffle(result)

    if (!args.withBoosted) {
      result = shuffledEmployees.slice(0, args.shuffle)
    } else {
      const boostedEmployees = shuffle([
        shuffledEmployees.find(({ famous, gender }) => famous && gender === 'f'),
        shuffledEmployees.find(({ famous, gender }) => famous && gender === 'f')
      ])
      const otherEmployees = shuffledEmployees.filter(e => !boostedEmployees.includes(e))

      result = [
        boostedEmployees.shift(),
        otherEmployees.shift(),
        boostedEmployees.shift()
      ]
        .concat(otherEmployees)
        .filter(Boolean)
        .filter((a, i, all) => all.findIndex(b => b.userId === a.userId) === i)
        .slice(0, args.shuffle)
    }
  }

  const userIds = result
    .map(e => e.userId)
    .filter(Boolean)

  if (userIds.length === 0) {
    return result
  }

  const users = await pgdb.public.users.find({ id: userIds })
    .then(result => result.map(transformUser))

  return result.map(e => ({
    ...e,
    user: users.find(u => u.id === e.userId)
  }))
}
