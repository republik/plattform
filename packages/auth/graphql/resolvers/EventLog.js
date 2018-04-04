
module.exports = {
  type (eventLog, args) {
    if (
      eventLog.action === 'INSERT' &&
      eventLog.oldData === null &&
      eventLog.newData &&
      eventLog.newData.sess.token
    ) {
      return 'TOKEN_REQUEST'
    }
    if (
      eventLog.action === 'UPDATE' &&
      eventLog.oldData &&
      eventLog.newData &&
      eventLog.oldData.sess.cookie.expires !==
        eventLog.newData.sess.cookie.expires
    ) {
      return 'ROLL_SESSION'
    }
    if (
      eventLog.action === 'UPDATE' &&
      eventLog.oldData &&
      eventLog.newData &&
      eventLog.oldData.sess.token &&
      eventLog.newData.sess.token === null
    ) {
      if (eventLog.newData.sess.passport.user) {
        return 'AUTHORIZE_SESSION'
      } else {
        return 'DENY_SESSION'
      }
    }
    if (
      eventLog.action === 'DELETE'
    ) {
      return 'SIGNOUT_TIMEOUT'
    }
    return 'UNKNOWN'
  }
}
