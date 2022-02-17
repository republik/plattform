import React from 'react'
import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { ChartTitle, ChartLead, Chart } from '@project-r/styleguide'
import { timeDay } from 'd3-time'
import { swissTime } from '../../../lib/utils/format'

// TODO: Real Query
const statusQuery = gql`
  query CockpitStatus($min: YearMonthDayDate!, $max: YearMonthDayDate!) {
    sharedMemberStats {
      evolution(min: $min, max: $max) {
        buckets {
          key
          users
        }
      }
    }
  }
`

const ShareChart = () => {
  return (
    <div>
      <div style={{ marginTop: 20 }}>
        <ChartTitle>
          Aktuell lesen 283 Personen die Republik mit einem geteilten Abo
        </ChartTitle>
        <ChartLead>
          Anzahl aktiver Nutzer, die Republik dank eines geteilten Abo lesen
        </ChartLead>
        <Chart
          config={{
            type: 'TimeBar',
            x: 'date',
            color: 'type',
            timeParse: '%Y-%m-%d',
            timeFormat: '%d-%m',
            height: 300,
            yTicks: [0, 200, 400, 600, 800],
          }}
          values={[
            { date: '2018-01-01', type: 'abo', value: 200 },
            { date: '2018-01-02', type: 'abo', value: 210 },
            { date: '2018-01-03', type: 'abo', value: 220 },
            { date: '2018-01-04', type: 'abo', value: 222 },
            { date: '2018-01-05', type: 'abo', value: 223 },
            { date: '2018-01-06', type: 'abo', value: 234 },
            { date: '2018-01-07', type: 'abo', value: 285 },
            { date: '2018-01-08', type: 'abo', value: 319 },
            { date: '2018-01-09', type: 'abo', value: 324 },
            { date: '2018-01-07', type: 'verkauf', value: 0 },
            { date: '2018-01-08', type: 'verkauf', value: 1 },
            { date: '2018-01-09', type: 'verkauf', value: 8 },
          ]}
        />
      </div>
    </div>
  )
}

export default compose()(ShareChart)
// graphql(statusQuery, {
//   props: ({ data, ownProps }) => {
//     return {
//       data,
//       ...mapActionData({ data, ownProps }),
//     }
//   },
//   options: () => {
//     const currentDay = timeDay.floor(new Date())
//     return {
//       variables: {
//         prev: formatYearMonthKey(timeDay.offset(currentDay, -1)),
//         max: formatYearMonthKey(timeDay.offset(currentDay, 30)),
//       },
//     }
//   },
// }),
