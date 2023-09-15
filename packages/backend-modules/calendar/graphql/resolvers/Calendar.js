const dayjs = require('dayjs')

const { transformUser } = require('@orbiting/backend-modules-auth')

const { stringify, createEvaluateSlot } = require('../../lib/utils')

const MAX_SLOTS = 31 * 2 // 2 months-ish

module.exports = {
  id: (calendar, args, context) => {
    const { __user: user } = calendar
    return stringify({ userId: user.id, calendarSlug: calendar.slug })
  },
  slots: async (calendar, args, context) => {
    const { __user: user } = calendar
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

    const users = !slots.length
      ? []
      : await pgdb.public.users
          .find({ id: [...new Set(slots.map((slot) => slot.userId))] })
          .then((users) => users.map(transformUser))

    return days.map(createEvaluateSlot({ calendar, slots, user, users }))
  },
}
