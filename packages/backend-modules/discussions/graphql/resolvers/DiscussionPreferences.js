module.exports = {
  notifications: async (preferences, _, { user, logger }) => {
    return (
      preferences.notifications ?? user._raw.defaultDiscussionNotificationOption
    )
  },
}
