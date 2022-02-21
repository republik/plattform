import React from 'react'
import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { ChartTitle, ChartLead, Chart, Loader } from '@project-r/styleguide'
import { timeDay } from 'd3-time'
import { swissTime } from '../../../lib/utils/format'
import withT from '../../../lib/withT'

// TODO: Real Query
const accessGrantQuery = gql`
  query accessGrantQuery($accessCampaignId: ID!, $min: Date!, $max: Date!) {
    accessGrantStats {
      evolution(accessCampaignId: $accessCampaignId, min: $min, max: $max) {
        buckets {
          date
          activeUnconverted
          converted
        }
        updatedAt
      }
      events(accessCampaignId: $accessCampaignId, min: $min, max: $max) {
        buckets {
          pledges
        }
        updatedAt
      }
    }
  }
`

const fakeData = {
  accessGrantStats: {
    evolution: {
      buckets: [
        {
          date: '01.02.2021',
          active: 418,
          activeUnconverted: 377,
          converted: 41,
        },
        {
          date: '02.02.2021',
          active: 405,
          activeUnconverted: 366,
          converted: 39,
        },
        {
          date: '03.02.2021',
          active: 395,
          activeUnconverted: 359,
          converted: 36,
        },
        {
          date: '04.02.2021',
          active: 399,
          activeUnconverted: 362,
          converted: 37,
        },
        {
          date: '05.02.2021',
          active: 395,
          activeUnconverted: 358,
          converted: 37,
        },
        {
          date: '06.02.2021',
          active: 399,
          activeUnconverted: 363,
          converted: 36,
        },
        {
          date: '07.02.2021',
          active: 405,
          activeUnconverted: 370,
          converted: 35,
        },
        {
          date: '08.02.2021',
          active: 400,
          activeUnconverted: 365,
          converted: 35,
        },
        {
          date: '09.02.2021',
          active: 387,
          activeUnconverted: 350,
          converted: 37,
        },
        {
          date: '10.02.2021',
          active: 365,
          activeUnconverted: 329,
          converted: 36,
        },
        {
          date: '11.02.2021',
          active: 348,
          activeUnconverted: 313,
          converted: 35,
        },
        {
          date: '12.02.2021',
          active: 347,
          activeUnconverted: 315,
          converted: 32,
        },
        {
          date: '13.02.2021',
          active: 342,
          activeUnconverted: 315,
          converted: 27,
        },
        {
          date: '14.02.2021',
          active: 341,
          activeUnconverted: 315,
          converted: 26,
        },
        {
          date: '15.02.2021',
          active: 330,
          activeUnconverted: 306,
          converted: 24,
        },
        {
          date: '16.02.2021',
          active: 318,
          activeUnconverted: 294,
          converted: 24,
        },
        {
          date: '17.02.2021',
          active: 319,
          activeUnconverted: 295,
          converted: 24,
        },
        {
          date: '18.02.2021',
          active: 322,
          activeUnconverted: 299,
          converted: 23,
        },
        {
          date: '19.02.2021',
          active: 307,
          activeUnconverted: 289,
          converted: 18,
        },
        {
          date: '20.02.2021',
          active: 301,
          activeUnconverted: 285,
          converted: 16,
        },
        {
          date: '21.02.2021',
          active: 299,
          activeUnconverted: 283,
          converted: 16,
        },
        {
          date: '22.02.2021',
          active: 300,
          activeUnconverted: 284,
          converted: 16,
        },
        {
          date: '23.02.2021',
          active: 285,
          activeUnconverted: 271,
          converted: 14,
        },
        {
          date: '24.02.2021',
          active: 277,
          activeUnconverted: 264,
          converted: 13,
        },
        {
          date: '25.02.2021',
          active: 271,
          activeUnconverted: 259,
          converted: 12,
        },
        {
          date: '26.02.2021',
          active: 260,
          activeUnconverted: 249,
          converted: 11,
        },
        {
          date: '27.02.2021',
          active: 261,
          activeUnconverted: 250,
          converted: 11,
        },
        {
          date: '28.02.2021',
          active: 257,
          activeUnconverted: 247,
          converted: 10,
        },
        {
          date: '01.03.2021',
          active: 247,
          activeUnconverted: 237,
          converted: 10,
        },
        {
          date: '02.03.2021',
          active: 239,
          activeUnconverted: 232,
          converted: 7,
        },
        {
          date: '03.03.2021',
          active: 225,
          activeUnconverted: 220,
          converted: 5,
        },
      ],
      updatedAt: '2022-02-18T13:43:56.834Z',
    },
  },
}

const formatDate = swissTime.format('%d.%m.%Y')

const ShareChart = ({ data, t }) => {
  return (
    <div style={{ marginTop: 20 }}>
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          if (!data.accessGrantData) return null
          const accessGrantData = [
            { type: 'activeUnconverted', label: 'Aktiv geteilte Abos' },
            { type: 'converted', label: 'Verkaufte Abos' },
          ]
            .map((key) => {
              return data.accessGrantStats.evolution.buckets.map((bucket) => {
                return {
                  date: bucket.date,
                  type: key.label,
                  value: bucket[key.type],
                }
              })
            })
            .flat()

          const currentActiveAccessGrants =
            data.accessGrantStats.evolution.buckets
              .slice(-1)
              .pop().activeUnconverted
          const soldMembership = data.accessGrantStats.events.buckets.reduce(
            (prev, curr) => prev + curr.pledges,
            0,
          )

          return (
            <>
              <ChartTitle>
                {t.elements('Share/chart/title', { currentActiveAccessGrants })}
              </ChartTitle>
              <ChartLead>
                {t.elements('Share/chart/lead', { soldMembership })}
              </ChartLead>
              <Chart
                config={{
                  type: 'TimeBar',
                  x: 'date',
                  color: 'type',
                  timeParse: '%d.%m.%Y',
                  timeFormat: '%d. %B',
                  height: 300,
                  yTicks: [0, 200, 400, 600, 800],
                  colorMap: {
                    'Aktiv geteilte Abos': '#256900',
                    'Verkaufte Abos': '#3CAD00',
                  },
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
    options: ({ accessCampaignId }) => {
      const currentDay = timeDay.floor(new Date())
      return {
        variables: {
          accessCampaignId,
          max: formatDate(currentDay),
          min: formatDate(timeDay.offset(currentDay, -30)),
        },
      }
    },
  }),
  withT,
)(ShareChart)
