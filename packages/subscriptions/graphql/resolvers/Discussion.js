const {
  getActiveSubscriptionsByUserForObjects
} = require('../../lib/Subscriptions')
const { paginate } = require('@orbiting/backend-modules-utils')

module.exports = {
  async userSubscriptionsForCommenters (discussion, args, context) {
    const { user: me, loaders: { Discussion } } = context
    if (!me) {
      return paginate(args, [])
    }

    const commenterIds = await Discussion.byIdCommenterIds.load(discussion.id)
    const subscriptions = await getActiveSubscriptionsByUserForObjects(
      me.id,
      {
        type: 'User',
        ids: commenterIds,
        filter: 'COMMENTS'
      },
      context
    )

    return paginate(args, subscriptions)
  }
}
