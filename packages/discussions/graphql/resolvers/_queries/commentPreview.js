const { Roles } = require('@orbiting/backend-modules-auth')
const { transform } = require('../../../lib/Comment')
const uuid = require('uuid/v4')

module.exports = async (_, args, context) => {
  const {
    loaders,
    user,
    t
  } = context

  Roles.ensureUserHasRole(user, 'member')

  const {
    id
  } = args

  const comment = id && await loaders.Comment.byId.load(id)

  if (id && !comment) {
    throw new Error(t('api/comment/404'))
  }

  if (comment) {
    return {
      ...comment,
      ...transform.edit(args)
    }
  } else {
    return transform.create(
      {
        ...args,
        id: uuid(),
        userId: user.id
      },
      context
    )
  }
}
