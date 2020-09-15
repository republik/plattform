const {
  getUnreadNotificationsForUserAndObject,
} = require('../../lib/Subscriptions')
const paginate = require('../../lib/paginateNotificationConnection')

module.exports = {
  async unreadNotifications(comment, args, context) {
    const { user: me } = context

    if (!me) {
      return paginate(args, [])
    }

    return paginate(
      args,
      await getUnreadNotificationsForUserAndObject(
        me.id,
        {
          type: 'Comment',
          id: comment.id,
        },
        context,
      ),
    )
  },
}
