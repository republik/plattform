const UserList = require('../../lib/UserList')

module.exports = {
  list ({ userListId, userId }, args, context) {
    return UserList.byIdForUser(userListId, userId, context)
  }
}
