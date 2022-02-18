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
          const accessGrantData = ['activeUnconverted', 'converted']
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
          const currentDay = timeDay.floor(new Date())
          const currentActiveAccessGrants = accessGrantData.filter(
            (day) =>
              day.type === 'activeUnconverted' &&
              day.date === formatDate(timeDay.offset(currentDay, -1)),
          )[0].value
          return (
            <>
              <ChartTitle>
                Aktuell lesen {currentActiveAccessGrants} Personen die Republik
                mit einem geteilten Abo
              </ChartTitle>
              <ChartLead>In den letzten 30 Tagen</ChartLead>
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
                values={accessGrantData}
              />
            </>
          )
        }}
      />
    </div>
  )
}

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
