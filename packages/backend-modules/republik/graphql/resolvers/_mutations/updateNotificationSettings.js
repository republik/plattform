const {
  ensureSignedIn,
  transformUser,
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, req, user: me }) => {
  ensureSignedIn(req)

  const { defaultDiscussionNotificationOption, notificationChannels } = args

  await pgdb.public.users.updateOne(
    { id: me.id },
    {
      defaultDiscussionNotificationOption,
      notificationChannels,
    },
    { skipUndefined: true },
  )

  return pgdb.public.users
    .findOne({
      id: me.id,
    })
    .then((u) => transformUser(u))
}
