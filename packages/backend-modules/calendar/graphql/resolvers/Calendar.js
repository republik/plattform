const dayjs = require('dayjs')

const { transformUser } = require('@orbiting/backend-modules-auth')

const { stringify } = require('../../lib/utils')

const MAX_SLOTS = 31 * 2 // 2 months-ish

module.exports = {
  id: (calendar, args, context) => {
    const { __user: user } = calendar
    return stringify({ userId: user.id, calendarSlug: calendar.slug })
  },
  slots: async (calendar, args, context) => {
    const { __user: user, limitSlotsPerKey, limitWeekdays } = calendar
    const { from, to } = args
    const { pgdb, loaders } = context

    const firstDate = dayjs(from)
    const lastDate = dayjs(to)
    const days = []

    for (
      let date = firstDate;
      date <= lastDate && days.length < MAX_SLOTS;
      date = date.clone().add(1, 'day')
    ) {
      days.push({ date, key: date.format('YYYY-MM-DD') })
    }

    const slots = await loaders.CalendarSlot.byKeyObj.load({
      calendarSlug: calendar.slug,
      key: days.map((day) => day.key),
      revokedAt: null,
    })

    const slotsUsers = !slots.length
      ? []
      : await pgdb.public.users
          .find({ id: [...new Set(slots.map((slot) => slot.userId))] })
          .then((users) => users.map(transformUser))

    const today = dayjs().startOf('day')

    return days.map(({ date, key }) => {
      const isInFuture = !today.isAfter(date)

      const keySlots = slots.filter((slot) => slot.key === key)

      const isOnAllowedWeekday = limitWeekdays.includes(date.day())
      const isSlotAvailable =
        keySlots.filter((slot) => slot.userId !== user.id).length <
        limitSlotsPerKey
      const userHasBooked = !!keySlots.find((slot) => slot.userId === user.id)

      const userCanBook =
        isInFuture && isOnAllowedWeekday && isSlotAvailable && !userHasBooked
      const userCanCancel = isInFuture && userHasBooked

      const users = slotsUsers.filter((user) =>
        keySlots.map((slot) => slot.userId).includes(user.id),
      )

      return {
        id: stringify({ userId: user.id, calendarSlug: calendar.slug, key }),
        key,
        userCanBook,
        userHasBooked,
        userCanCancel,
        users,
      }
    })
  },
}
