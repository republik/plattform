#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')
const { ascending } = require('d3-array')
const { timeDay } = require('d3-time')
const { nest } = require('d3-collection')
const fs = require('fs')
const path = require('path')

const applicationName = 'backends republik script prolong analyse'

ConnectionContext.create(applicationName)
  .then(async (context) => {
    const { pgdb } = context

    const users = await pgdb.query(`
      SELECT
        u.id,
        u."createdAt",
        json_agg(
          json_build_object(
          'membership', m."sequenceNumber",
          'interval', mt.interval,
          'kind', mp.kind,
          'begin', mp."beginDate",
          'end', mp."endDate"
          ) ORDER BY mp."beginDate"
        ) as "periods"
      FROM
        users u
      JOIN
        "memberships" m
        ON m."userId" = u.id
      JOIN
        "membershipTypes" mt
        ON m."membershipTypeId" = mt.id
      JOIN
        "membershipPeriods" mp
        ON mp."membershipId" = m.id
      WHERE u.email != 'jefferson@project-r.construction'
      GROUP BY 1
      -- ORDER BY COUNT(mp.id) DESC
    `)

    // only consider expires until:
    // - last period record
    // - minus 14 days grace period
    const endOfRecords = await pgdb.queryOneField(
      `SELECT MAX(GREATEST("updatedAt", "createdAt")) - '14 days'::interval FROM "membershipPeriods"`,
    )

    console.log('users', users.length, 'endOfRecords', endOfRecords)

    const usersWithOverlaps = new Set()
    const usersWithSwallowed = new Set()

    users.forEach((user) => {
      user.periods.forEach((period, i, all) => {
        period.beginDate = new Date(period.begin)
        period.endDate = new Date(period.end)

        const prevPeriod = all[i - 1]
        if (prevPeriod && period.beginDate < prevPeriod.endDate) {
          usersWithOverlaps.add(user)
          period.beginDate = prevPeriod.endDate
          period.modification = 'trim'
          if (period.endDate < prevPeriod.endDate) {
            usersWithSwallowed.add(user)
            period.endDate = prevPeriod.endDate
            period.modification = 'empty'
          }
        }

        period.days = timeDay.count(period.beginDate, period.endDate)
      })

      user.events = []
      user.totalDays = user.periods
        .filter(({ days }) => days > 0)
        .reduce((totalDays, period, i, all) => {
          const { days } = period
          const prevAge = Math.floor(totalDays / 365)
          const newAge = Math.floor((totalDays + days) / 365)
          const prevPeriod = all[i - 1]
          if (prevPeriod) {
            const gapless =
              period.beginDate - prevPeriod.endDate < 1000 * 60 * 60 * 24
            if (!gapless) {
              user.events.push({
                type: 'expire',
                interval: prevPeriod.interval,
                date: prevPeriod.endDate,
                age: prevAge,
              })
            } else if (prevPeriod.interval !== period.interval) {
              user.events.push({
                type: 'changeInterval',
                interval: prevPeriod.interval,
                date: prevPeriod.endDate,
                age: prevAge,
              })
            }

            if (newAge > prevAge) {
              user.events.push({
                type: gapless ? 'anniversary' : 'return',
                interval: period.interval,
                date: period.beginDate,
                age: prevAge,
              })
            }
          }
          const nextPeriod = all[i + 1]
          if (!nextPeriod && period.endDate < endOfRecords) {
            user.events.push({
              type: 'expire',
              interval: period.interval,
              date: period.endDate,
              age: newAge,
            })
          }
          return totalDays + days
        }, 0)
      // console.log('total days', user.totalDays, user.id)
      // console.log(user.events)
      // console.log(user.periods.map(p => [p.interval, p.begin, p.end]))
      // console.log('---')
    })

    const allEvents = users.map((user) => user.events).flat()

    const calculateRate = ({
      anniversary = 0,
      changeInterval = 0,
      expire = 0,
    }) =>
      (anniversary + changeInterval) / (expire + anniversary + changeInterval)

    console.log(
      JSON.stringify(
        nest()
          .key((d) => d.age)
          .sortKeys(ascending)
          .key((d) => d.date.getFullYear())
          .sortKeys(ascending)
          .key((d) => d.interval)
          .key((d) => d.type)
          .rollup((values) => values.length)
          .entries(allEvents)
          .map(({ key, values }) => {
            return {
              key,
              values: values.map(({ key: year, values }) => {
                const intervals = values.map(({ key: interval, values }) => {
                  const object = values.reduce(
                    (obj, { key, value }) => {
                      obj[key] = value
                      return obj
                    },
                    { interval },
                  )
                  object.rate = calculateRate(object)
                  return object
                })
                return {
                  key: year,
                  intervals,
                }
              }),
            }
          }),
        undefined,
        2,
      ),
    )

    console.log('usersWithOverlaps', usersWithOverlaps.size)
    console.log('usersWithSwallowed', usersWithSwallowed.size)

    // clean up for easier analysis
    users.forEach((user) => {
      user.periods.forEach((period) => {
        period.beginDate = undefined
        period.endDate = undefined
      })
    })
    fs.writeFileSync(
      path.resolve(__dirname, '..', 'data', 'prolongUsers.json'),
      JSON.stringify(users, undefined, 2),
    )

    return context
  })
  .then((context) => ConnectionContext.close(context))
