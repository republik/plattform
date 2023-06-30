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
  if (!userHasBooked) {
    throw new Error(t('api/calendar/slot/error/404'))
  }

  await pgdb.public.calendarSlots.updateOne(
    {
      calendarSlug: calendar.slug,
      userId: user.id,
      key,
      revokedAt: null,
    },
    { revokedAt: new Date() },
  )

  const today = dayjs().startOf('day')
  const date = dayjs(key)

  const isInFuture = !today.isAfter(date)

  const isOnAllowedWeekday = calendar.limitWeekdays.includes(date.day())
  const isSlotAvailable =
    userSlots.filter((slot) => slot.key === key && slot.userId !== user.id)
      .length < calendar.limitSlotsPerKey

  const userCanBook = isInFuture && isOnAllowedWeekday && isSlotAvailable
  // const userHasBooked = false
  const userCanCancel = false

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

  // @TODO: Cancel and restore

  return {
    id: stringify({ userId: user.id, calendarSlug: calendar.slug, key }),
    key,
    userCanBook,
    userHasBooked: false,
    userCanCancel,
    users,
  }
}
