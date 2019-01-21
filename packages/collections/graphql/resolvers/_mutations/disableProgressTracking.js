const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Progress = require('../../../lib/Progress')
const clearProgress = require('./clearProgress')

module.exports = async (_, args, context) => {
  const { user: me, req } = context
  ensureSignedIn(req)

  await Progress.disable(me.id, context)
  await clearProgress(null, null, context)

  return me
}
