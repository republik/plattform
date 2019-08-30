const { subscribe } = require('../../../lib/Subscriptions')

module.exports = async (_, args, context) => {
  const { user: me } = context

  return subscribe(
    { ...args, userId: me.id },
    context
  )
}
