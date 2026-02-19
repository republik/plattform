module.exports = {
  notifications: async (preferences, _, { user, logger }) => {
    logger.debug(preferences, 'DEBUG PREFERENCES')
    return (
      preferences.notifications ?? user._raw.defaultDiscussionNotificationOption
    )
  },
}
