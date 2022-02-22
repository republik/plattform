import React from 'react'
import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { ChartTitle, ChartLead, Chart, Loader } from '@project-r/styleguide'
import { timeDay } from 'd3-time'
import { max, sum } from 'd3-array'
import { swissTime } from '../../../lib/utils/format'
import withT from '../../../lib/withT'
import { scaleLinear } from 'd3-scale'

{
  /*
    accessCampaignIds:
    b86c78c5-b36b-4de6-8656-44d5e1ba410b "Verschenken" 
    e3568e03-b6b3-46c5-b07a-e9afeea92023 "Teilen Sie Ihr Abonnement" 
  */
}

const accessGrantQuery = gql`
  query accessGrantQuery($min: Date!, $max: Date!) {
    accessGrantStats {
      evolution(
        accessCampaignId: "e3568e03-b6b3-46c5-b07a-e9afeea92023"
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
        accessCampaignId: "e3568e03-b6b3-46c5-b07a-e9afeea92023"
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

          const mergedEvolutionBuckets = evolution.buckets
            .map((bucket) => {
              const bucket2 = evolution2.buckets.find(
                (bucket2) => bucket.date === bucket2.date,
              )
              return {
                date: bucket.date,
                activeUnconverted:
                  bucket.activeUnconverted +
                  (bucket2 ? bucket2.activeUnconverted : 0),
                converted: bucket.converted + (bucket2 ? bucket2.converted : 0),
              }
            })
            .concat(
              evolution2.buckets.filter(
                (bucket) =>
                  !evolution.buckets.find(
                    (bucket2) => bucket.date === bucket2.date,
                  ),
              ),
            )

          const maxBarValue = Math.max(
            max(
              mergedEvolutionBuckets,
              (bucket) => bucket.activeUnconverted + bucket.converted,
            ),
            10,
          )
          if (!mergedEvolutionBuckets.length || !maxBarValue) {
            return null
          }
          const yTicksNumber = maxBarValue > 100 ? 5 : 3
          const yScale = scaleLinear()
            .domain([0, maxBarValue])
            .nice(yTicksNumber)

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

          const soldMembership =
            sum(events.buckets.map((bucket) => bucket.pledges)) +
            sum(events2.buckets.map((bucket) => bucket.pledges))

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
                  domain: yScale.domain(),
                  yTicks: yScale.ticks(yTicksNumber),
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
