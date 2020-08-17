const {
  ensureSignedIn, transformUser
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, req, user: me }) => {
  ensureSignedIn(req)

  const {
    defaultDiscussionNotificationOption,
    discussionNotificationChannels
  } = args

  await pgdb.public.users.updateOne(
    { id: me.id },
    {
      defaultDiscussionNotificationOption,
      discussionNotificationChannels
    },
    { skipUndefined: true }
  )

  return pgdb.public.users.findOne({
    id: me.id
  })
    .then(u => transformUser(u))
}
