import React from 'react'
import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { ChartTitle, ChartLead, Chart, Loader } from '@project-r/styleguide'
import { timeDay } from 'd3-time'
import { swissTime } from '../../../lib/utils/format'
import withT from '../../../lib/withT'

{
  /* b86c78c5-b36b-4de6-8656-44d5e1ba410b = "Verschenken" 
  e3568e03-b6b3-46c5-b07a-e9afeea92023 "Teilen Sie Ihr Abonnement" */
}

const accessGrantQuery = gql`
  query accessGrantQuery($min: Date!, $max: Date!) {
    accessGrantStats {
      evolution(
        accessCampaignId: "b86c78c5-b36b-4de6-8656-44d5e1ba410b"
        min: $min
        max: $max
      ) {
        buckets {
          date
          activeUnconverted
          converted
        }
        updatedAt
      }
      events(
        accessCampaignId: "b86c78c5-b36b-4de6-8656-44d5e1ba410b"
        min: $min
        max: $max
      ) {
        buckets {
          pledges
        }
        updatedAt
      }
    }
    accessGrantStats2: accessGrantStats {
      evolution(
        accessCampaignId: "b86c78c5-b36b-4de6-8656-44d5e1ba410b"
        min: $min
        max: $max
      ) {
        buckets {
          date
          activeUnconverted
          converted
        }
        updatedAt
      }
      events(
        accessCampaignId: "b86c78c5-b36b-4de6-8656-44d5e1ba410b"
        min: $min
        max: $max
      ) {
        buckets {
          pledges
        }
        updatedAt
      }
    }
  }
`

const formatDate = swissTime.format('%d.%m.%Y')

const ShareChart = ({ data, t }) => {
  return (
    <div style={{ margin: '16px 0px 32px 0px' }}>
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          if (!data.accessGrantStats) return null

          const { events, evolution } = data.accessGrantStats
          const { events: events2, evolution: evolution2 } =
            data.accessGrantStats2

          if (
            events.buckets.length === 0 ||
            evolution.buckets.length === 0 ||
            events2.buckets.length === 0 ||
            evolution2.buckets.length === 0
          )
            return null

          const mergedEvolutionBuckets = evolution.buckets.map((item, i) => {
            return {
              date: item.date,
              activeUnconverted:
                item.activeUnconverted +
                evolution2.buckets[
                  evolution2.buckets.findIndex(
                    (secondItem) => item.date === secondItem.date,
                  )
                ].activeUnconverted,
              converted:
                item.converted +
                evolution2.buckets[
                  evolution2.buckets.findIndex(
                    (secondItem) => item.date === secondItem.date,
                  )
                ].converted,
            }
          })

          const mergedEventsBuckets = events.buckets.map((item, i) => {
            return {
              pledges: item.pledges + events2.buckets[i].pledges,
            }
          })

          const accessGrantData = ['activeUnconverted', 'converted']
            .map((key) => {
              return mergedEvolutionBuckets.map((bucket) => {
                return {
                  date: bucket.date,
                  type: t(`Share/chart/labels/${key}`),
                  value: bucket[key],
                }
              })
            })
            .flat()

          const currentActiveAccessGrants = mergedEvolutionBuckets
            .slice(-1)
            .pop().activeUnconverted

          const soldMembership = mergedEventsBuckets.reduce(
            (prev, curr) => prev + curr.pledges,
            0,
          )

          return (
            <>
              <ChartTitle>
                {t('Share/chart/title', { currentActiveAccessGrants })}
              </ChartTitle>
              <ChartLead>{t('Share/chart/lead', { soldMembership })}</ChartLead>
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
                    [t('Share/chart/labels/activeUnconverted')]: '#256900',
                    [t('Share/chart/labels/converted')]: '#3CAD00',
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
    options: () => {
      const currentDay = timeDay.floor(new Date())
      return {
        variables: {
          max: formatDate(currentDay),
          min: formatDate(timeDay.offset(currentDay, -30)),
        },
      }
    },
  }),
  withT,
)(ShareChart)
