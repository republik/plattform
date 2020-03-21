const {
  getUnreadNotificationsForUserAndObject
} = require('../../lib/Subscriptions')

module.exports = {
  unreadNotification (comment, args, context) {
    const { user: me } = context

    if (!me) {
      return null
    }

    return getUnreadNotificationsForUserAndObject(
      me.id,
      {
        type: 'Comment',
        id: comment.id
      },
      context
    )
  }
}
