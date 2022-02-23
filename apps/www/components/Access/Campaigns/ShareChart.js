import React from 'react'
import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import {
  ChartTitle,
  ChartLead,
  ChartLegend,
  Chart,
  Loader,
} from '@project-r/styleguide'
import { timeDay } from 'd3-time'
import { ascending, max, mean, min } from 'd3-array'
import { swissNumbers, swissTime } from '../../../lib/utils/format'
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
          active
          activeUnconverted
          converted
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
const formatDateTime = swissTime.format('%d.%m.%Y %H:%M')
const formatPercent = swissNumbers.format('.0%')

const ShareChart = ({ data, t }) => {
  return (
    <div style={{ margin: '16px 0px 32px 0px' }}>
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          if (!data.accessGrantStats) return null

          const { evolution } = data.accessGrantStats
          const { evolution: evolution2 } = data.accessGrantStats2

          const mergedEvolutionBuckets = evolution.buckets
            .map((bucket) => {
              const bucket2 = evolution2.buckets.find(
                (bucket2) => bucket.date === bucket2.date,
              )
              return {
                date: bucket.date,
                active: bucket.active + (bucket2 ? bucket2.active : 0),
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
            .sort((a, b) => ascending(new Date(a.date), new Date(b.date)))
            .map((bucket) => {
              return {
                ...bucket,
                rate: bucket.converted / bucket.active,
              }
            })

          if (!mergedEvolutionBuckets.length) {
            return null
          }
          const maxBarValue = Math.max(
            max(mergedEvolutionBuckets, (bucket) => bucket.active),
            10,
          )
          const finishedBuckets =
            mergedEvolutionBuckets.length === 60 &&
            mergedEvolutionBuckets.slice(0, 30)
          const averageRate =
            finishedBuckets && mean(finishedBuckets, (bucket) => bucket.rate)
          const averageActive =
            finishedBuckets && mean(finishedBuckets, (bucket) => bucket.active)

          const yTicksNumber = maxBarValue > 100 ? 5 : 3
          const yScale = scaleLinear()
            .domain([0, maxBarValue])
            .nice(yTicksNumber)

          const accessGrantData = ['converted', 'activeUnconverted']
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

          const lastBucket = mergedEvolutionBuckets.slice(-1).pop()

          return (
            <>
              <ChartTitle>
                {t('Share/chart/title', {
                  currentActiveAccessGrants: lastBucket.activeUnconverted,
                })}
              </ChartTitle>
              <ChartLead>
                {t('Share/chart/lead', {
                  averagePercent: formatPercent(averageRate),
                  days: mergedEvolutionBuckets.length,
                })}
              </ChartLead>
              <Chart
                config={{
                  type: 'TimeBar',
                  x: 'date',
                  xBandPadding: 0,
                  color: 'type',
                  timeParse: '%d.%m.%Y',
                  timeFormat: '%d. %B',
                  height: 300,
                  domain: yScale.domain(),
                  yTicks: yScale.ticks(yTicksNumber),
                  xTicks: [
                    mergedEvolutionBuckets[0].date,
                    mergedEvolutionBuckets[
                      Math.round(mergedEvolutionBuckets.length / 2)
                    ]?.date,
                    lastBucket.date,
                  ].filter(Boolean),
                  xAnnotations: [
                    averageRate && {
                      x1: mergedEvolutionBuckets[0].date,
                      x2: mergedEvolutionBuckets[29].date,
                      value: averageActive * averageRate,
                      showValue: false,
                      label: t('Share/chart/annotation/averageRate', {
                        percent: formatPercent(averageRate),
                      }),
                    },
                    {
                      x1: lastBucket.date,
                      x2: lastBucket.date,
                      value: lastBucket.activeUnconverted,
                      label: t('Share/chart/annotation/lastBucket'),
                    },
                  ].filter(Boolean),
                  colorLegendValues: [],
                  colorMap: {
                    [t('Share/chart/labels/activeUnconverted')]: '#256900',
                    [t('Share/chart/labels/converted')]: '#3CAD00',
                  },
                }}
                values={accessGrantData}
              />
              <ChartLegend>
                {t('Share/chart/legend', {
                  formattedDateTime: formatDateTime(
                    min([
                      new Date(evolution.updatedAt),
                      new Date(evolution2.updatedAt),
                    ]),
                  ),
                })}
              </ChartLegend>
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
          min: formatDate(timeDay.offset(currentDay, -59)),
        },
      }
    },
  }),
  withT,
)(ShareChart)
