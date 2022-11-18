const debug = require('debug')('statistics:lib:pgdb:redirections')

const find = async ({ date, targets }, { pgdb }) => {
  debug('find() %o', { date })

  const rows = await pgdb.public.redirections.find(
    {
      target: targets,
      or: [{ 'deletedAt >': date }, { deletedAt: null }],
    },
    {
      fields: ['source', 'target'],
      orderBy: 'createdAt',
    },
  )

  const redirections = {}

  rows.forEach(({ source, target }) => {
    if (!redirections[target]) {
      redirections[target] = []
    }

    redirections[target].push(source)
  })

  return redirections
}

module.exports.find = find
