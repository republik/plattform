const _ = require('lodash')

const bulk = require('../../lib/indexPgTable')

const transform = function (row) {
  const user = _.find(this.payload.users, { id: row.userId })

  if (user) {
    return {
      ...row,
      user: {
        facebookId: user.facebookId,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        twitterHandle: user.twitterHandle,
        username: user.username
      }
    }
  }

  return row
}

module.exports = async ({ pgdb, ...rest }) => {
  const resource = {
    table: pgdb.public.comments,
    payload: {
      users: await pgdb.public.users.find(
        {},
        {
          fields: [
            'id',
            'firstName',
            'lastName',
            'username',
            'twitterHandle',
            'facebookId'
          ]
        }
      )
    },
    transform
  }
  return bulk.index({ resource, ...rest })
}
