import React from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { timeDay } from 'd3-time'

import { timeFormat } from '../../lib/utils/format'
import { t } from '../../lib/withT'

import { Loader } from '@project-r/styleguide'
import { Chart } from '@project-r/styleguide'

const getStats = gql`
  query getMembershipPeriodStats {
    membershipStats {
      periods(
        minEndDate: "01.01.2019"
        maxEndDate: "15.01.2019"
        membershipTypes: ["ABO", "BENEFACTOR_ABO"]
      ) {
        id
        totalMemberships
        days {
          id
          date
          prolongCount
          cancelCount
        }
      }
    }
  }
`

const CHART_CONFIG = {
  type: 'TimeBar',
  color: 'action',
  numberFormat: '.0%',
  colorRange: ['#2ca02c', '#F6F8F7', '#9467bd'],
  colorLegendValues: [
    t('stats/membershipPeriods/labels/prolong'),
    t('stats/membershipPeriods/labels/cancel'),
  ],
  domain: [0, 1],
  padding: 30,
  x: 'date',
  xInterval: 'day',
  timeParse: '%d.%m.%Y',
  timeFormat: '%d.%m.%Y',
  yTicks: [0, 0.5, 0.66, 1],
}

const formatDate = timeFormat(CHART_CONFIG.timeParse)

const MembershipPeriodStats = ({
  data: { loading, error, membershipStats },
}) => (
  <Loader
    style={{ minHeight: 320 }}
    loading={loading}
    error={error}
    render={() => {
      const startDayDate = new Date('2018-11-23T23:00:00.000Z')
      const startDay = formatDate(startDayDate)
      const endDayDate = new Date('2019-01-31T23:00:00.000Z')
      // const endDay = formatDate(endDayDate)
      const days = timeDay.range(startDayDate, endDayDate)
      const prolongValues = days.map((date) => ({
        action: t('stats/membershipPeriods/labels/prolong'),
        date: formatDate(date),
        value: String(0),
      }))
      const remainingValues = days.map((date) => ({
        action: 'Offen',
        date: formatDate(date),
        value: String(0),
      }))
      const cancelValues = days.map((date) => ({
        action: t('stats/membershipPeriods/labels/cancel'),
        date: formatDate(date),
        value: String(0),
      }))

      const total = membershipStats.periods.totalMemberships
      const sums = membershipStats.periods.days.reduce(
        (agg, day) => {
          agg.prolong += day.prolongCount
          agg.cancel += day.cancelCount
          agg.prolongRate = agg.prolong / total
          agg.cancelRate = agg.cancel / total
          agg.day = day.date
          const prolongValue = prolongValues.find((v) => v.date === day.date)
          if (prolongValue) {
            prolongValue.value = String(agg.prolongRate)
          }
          const cancelValue = cancelValues.find((v) => v.date === day.date)
          if (cancelValue) {
            cancelValue.value = String(agg.cancelRate)
          }
          const remainingValue = remainingValues.find(
            (v) => v.date === day.date,
          )
          if (remainingValue) {
            remainingValue.value = String(1 - agg.prolongRate - agg.cancelRate)
          }
          return agg
        },
        {
          prolong: 0,
          cancel: 0,
        },
      )
      const now = new Date()

      return (
        <Chart
          config={{
            ...CHART_CONFIG,
            xAnnotations: [
              {
                x1: startDay,
                x2: sums.day,
                label: t(
                  `stats/membershipPeriods/prolongRate/${
                    endDayDate > now ? 'current' : 'past'
                  }`,
                ),
                value: sums.prolongRate,
              },
            ].filter(Boolean),
          }}
          values={prolongValues.concat(remainingValues).concat(cancelValues)}
        />
      )
    }}
  />
)

export default compose(graphql(getStats))(MembershipPeriodStats)
