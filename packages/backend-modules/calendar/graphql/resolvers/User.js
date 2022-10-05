const { Roles } = require('@orbiting/backend-modules-auth')

const PRIVILEDGED_ROLES = ['admin', 'supporter']

module.exports = {
  calendar: async (user, args, context) => {
    const { slug } = args
    const { user: me, loaders, t } = context

    if (!Roles.userIsMeOrInRoles(user, me, PRIVILEDGED_ROLES)) {
      return null
    }

    const calendar = await loaders.Calendar.bySlug.load(slug)
    if (!calendar) {
      throw new Error(t('api/calendar/404'))
    }

    if (
      calendar.limitRoles?.length &&
      !Roles.userIsInRoles(user, calendar.limitRoles)
    ) {
      return null
    }

    return {
      ...calendar,
      __user: user,
    }
  },
}
