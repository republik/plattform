import React from 'react'
import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { ChartTitle, ChartLead, Chart, Loader } from '@project-r/styleguide'
import { timeDay } from 'd3-time'
import { swissTime } from '../../../lib/utils/format'

// TODO: Real Query
const accessGrantQuery = gql`
  query accessGrantQuery($min: Date!, $max: Date!) {
    accessGrantStats {
      periods(min: $min, max: $max) {
        days {
          date
          active
          activeUnconverted
          converted
        }
        updatedAt
      }
    }
  }
`

const formatDate = swissTime.format('%d.%m.%Y')

const ShareChart = ({ data }) => {
  return (
    <div style={{ marginTop: 20 }}>
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          const array = ['activeUnconverted', 'converted']
            .map((key) => {
              return data.accessGrantStats.periods.days.map((day) => {
                return {
                  date: day.date,
                  type: key,
                  value: day[key],
                }
              })
            })
            .flat()
          return (
            <>
              <ChartTitle>
                Aktuell lesen 283 Personen die Republik mit einem geteilten Abo
              </ChartTitle>
              <ChartLead>
                Anzahl aktiver Nutzer, die Republik dank eines geteilten Abo
                lesen
              </ChartLead>
              <Chart
                config={{
                  type: 'TimeBar',
                  x: 'date',
                  color: 'type',
                  timeParse: '%d.%m.%Y',
                  timeFormat: '%d-%m',
                  height: 300,
                  yTicks: [0, 200, 400, 600, 800],
                }}
                values={array}
              />
            </>
          )
        }}
      />
    </div>
  )
}

// [
//   { date: '2018-01-01', type: 'abo', value: 200 },
//   { date: '2018-01-02', type: 'abo', value: 210 },
//   { date: '2018-01-03', type: 'abo', value: 220 },
//   { date: '2018-01-04', type: 'abo', value: 222 },
//   { date: '2018-01-05', type: 'abo', value: 223 },
//   { date: '2018-01-06', type: 'abo', value: 234 },
//   { date: '2018-01-07', type: 'abo', value: 285 },
//   { date: '2018-01-08', type: 'abo', value: 319 },
//   { date: '2018-01-09', type: 'abo', value: 324 },
//   { date: '2018-01-07', type: 'verkauf', value: 0 },
//   { date: '2018-01-08', type: 'verkauf', value: 1 },
//   { date: '2018-01-09', type: 'verkauf', value: 8 },
// ]

export default compose(
  graphql(accessGrantQuery, {
    options: () => {
      const currentDay = timeDay.floor(new Date())
      return {
        variables: {
          max: formatDate(timeDay.offset(currentDay, -1)),
          min: formatDate(timeDay.offset(currentDay, -30)),
        },
      }
    },
  }),
)(ShareChart)
