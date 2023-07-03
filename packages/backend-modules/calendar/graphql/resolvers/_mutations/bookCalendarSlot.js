const dayjs = require('dayjs')

const { Roles, transformUser } = require('@orbiting/backend-modules-auth')

const { parse, stringify, isKeyValid } = require('../../../lib/utils')

module.exports = async (_, args, context) => {
  const { id, userId } = args
  const { user: me, pgdb, loaders, t } = context

  const { calendarSlug, key } = parse(id)

  if (!isKeyValid(key)) {
    throw new Error(t('api/calendar/slot/error/keyInvalid'))
  }

  const date = dayjs(key)

  const calendar = await loaders.Calendar.bySlug.load(calendarSlug)
  if (!calendar) {
    throw new Error(t('api/calendar/404'))
  }

  const isMyself = !userId || me.id === userId
  const user = isMyself ? me : await loaders.User.byId.load(userId)
  if (!user) {
    throw new Error(t('api/users/404'))
  }

  if (
    calendar.limitRoles?.length &&
    !Roles.userIsInRoles(user, calendar.limitRoles)
  ) {
    t.pluralize('api/unauthorized', {
      count: calendar.limitRoles.length,
      role: calendar.limitRoles.map((r) => `«${r}»`).join(', '),
    })
  }

  const userSlots = await loaders.CalendarSlot.byKeyObj.load({
    calendarSlug: calendar.slug,
    key,
    revokedAt: null,
  })

  const userHasBooked = !!userSlots.find(
    (slot) => slot.key === key && slot.userId === user.id,
  )
  if (userHasBooked) {
    throw new Error(t('api/calendar/slot/error/userBookedAlready'))
  }

  const isOnAllowedWeekday = calendar.limitWeekdays.includes(date.day())
  if (!isOnAllowedWeekday) {
    throw new Error(t('api/calendar/slot/error/slotIsNotOnAllowedWeekday'))
  }

  const isSlotAvailable =
    userSlots.filter((slot) => slot.key === key && slot.userId !== user.id)
      .length < calendar.limitSlotsPerKey
  if (!isSlotAvailable) {
    throw new Error(t('api/calendar/slot/error/slotIsNotAvailable'))
  }

  await pgdb.public.calendarSlots.insert({
    calendarSlug,
    userId: user.id,
    key,
  })

  const slots = await pgdb.public.calendarSlots.find({
    calendarSlug,
    key,
    revokedAt: null,
  })

  const users = slots.length
    ? await pgdb.public.users
        .find({ id: slots.map((slot) => slot.userId) })
        .then((users) => users.map(transformUser))
    : []

  return {
    id: stringify({ userId: user.id, calendarSlug: calendar.slug, key }),
    key,
    userCanBook: false,
    userHasBooked: true,
    userCanCancel: true,
    users,
  }
}
