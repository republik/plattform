const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Progress = require('../../../lib/Progress')

module.exports = async (_, args, context) => {
  const { user: me, req } = context
  ensureSignedIn(req)

  await Progress.enable(me.id, context)

  return me
}
