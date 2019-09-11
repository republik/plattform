const {
  getSubscriptionsByUserForObjects
} = require('../../lib/Subscriptions')
const { paginate } = require('@orbiting/backend-modules-utils')

module.exports = {
  async userSubscriptionsForCommenters (discussion, args, context) {
    const { user: me, loaders: { Discussion } } = context
    if (!me) {
      return
    }

    const commenterIds = await Discussion.byIdCommenterIds.load(discussion.id)
    const subscriptions = await getSubscriptionsByUserForObjects(
      me.id,
      'User',
      commenterIds,
      'COMMENTS',
      context
    )

    return paginate(args, subscriptions)
  }
}
