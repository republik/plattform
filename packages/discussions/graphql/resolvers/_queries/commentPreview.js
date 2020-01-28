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
    // TODO remove if FE is ready
    id = uuid(),
    discussionId
  } = args

  const discussion = await loaders.Discussion.byId.load(discussionId)
  if (!discussion) {
    throw new Error(t('api/discussion/404'))
  }

  const comment = id && await loaders.Comment.byId.load(id)

  if (comment) {
    return {
      ...comment,
      ...transform.edit(args)
    }
  } else {
    return transform.create(
      {
        ...args,
        id,
        userId: user.id
      },
      context
    )
  }
}
