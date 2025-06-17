import { gql } from '@apollo/client'
import { extent } from 'd3-array'
import { timeMonth } from 'd3-time'
import compose from 'lodash/flowRight'
import Router, { withRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { css } from '@republik/theme/css'
import {
  Chart,
  ChartLead,
  ChartLegend,
  ChartTitle,
  Editorial,
  H2,
  Interaction,
  LazyLoad,
  Loader,
  P,
  mediaQueries,
} from '@project-r/styleguide'

import Frame from '../components/Frame'
import { countFormat } from '../lib/utils/format'

import { RawStatus } from '../components/Crowdfunding/Status'

import withT from '../lib/withT'

import { ListWithQuery as TestimonialList } from '../components/Testimonial/List'

import Link from 'next/link'
import { createGetStaticProps } from '../lib/apollo/helpers'
import withMe from '../lib/apollo/withMe'
import { CDN_FRONTEND_BASE_URL } from '../lib/constants'
import { swissTime } from '../lib/utils/format'
import withInNativeApp from '../lib/withInNativeApp'

import { CAMPAIGN_META_ARTICLE_URL } from '@app/app/(campaign)/constants'
import { getCMSClientBase } from '@app/lib/apollo/cms-client-base'
import { CockpitDocument } from '#graphql/cms/__generated__/gql/graphql'
import { StructuredText } from 'react-datocms'

// Revalidate every 5 minutes
const COCKPIT_PAGE_SSG_REVALIDATE = 60 * 5

/**
 * Generate a list of ticks for a chart, starting at 0 and going to max, then from 0 to min
 * at a given step size.
 * @param {number} minimum value (expected to be negative)
 * @param {number} max value (expected to be positive)
 * @param {number[]} step size
 */
function getChartTicks(min, max, step) {
  const ticks = [0]
  // from 0 to max, add step
  for (let i = 0; i <= max; i += step) {
    ticks.push(i)
  }
  // from 0 to min, add step
  for (let i = 0; i >= min; i -= step) {
    ticks.push(i)
  }
  return Array.from(new Set(ticks)).sort((a, b) => a - b)
}

const statusQuery = gql`
  query CockpitStatus(
    $prev: YearMonthDate!
    $max: YearMonthDate!
    $accessToken: ID
  ) {
    membershipStats {
      evolution(min: "2018-01", max: $max) {
        updatedAt
        buckets {
          key
          active
          overdue
          ended
          pending
          pendingSubscriptionsOnly
          gaining
        }
      }
      lastSeen(min: $prev, max: $max) {
        buckets {
          key
          users
        }
      }
    }
    discussionsStats {
      evolution(min: "2018-01", max: $max) {
        buckets {
          key
          users
        }
      }
    }
    collectionsStats {
      progress: evolution(name: "progress", min: "2019-03", max: $max) {
        buckets {
          key
          users
        }
      }
      bookmarks: evolution(name: "bookmarks", min: "2019-01", max: $max) {
        buckets {
          key
          users
        }
      }
    }
    actionMe: me(accessToken: $accessToken) {
      id
    }
  }
`

const styles = {
  structuredText: css({
    color: 'contrast',
    textStyle: 'serif',
    fontSize: 'xl',
    '& p': {
      marginY: 6,
    },
    '&>*:not(:first-child)': {
      marginTop: '3',
    },
    '& ul > li': {
      listStyleType: 'none',
      pl: '6',
      position: 'relative',
      '&:not(:first-child)': {
        marginTop: '1',
      },
      '&::before': { content: '"–"', position: 'absolute', left: '0' },
    },
    '& ol': { listStyleType: 'decimal', paddingLeft: '6', marginLeft: '2' },
    '& ol > li': {
      '&:not(:first-child)': {
        marginTop: '1',
      },
    },
    '& h2, & h3, & h4, & h5, & h6': {
      fontWeight: 'bold',
    },
    '& a': {
      textDecoration: 'underline',
    },
  }),
}

const numMembersNeeded = 33000

const formatDateTime = swissTime.format('%d.%m.%Y %H:%M')

const YEAR_MONTH_FORMAT = '%Y-%m'
const formatYearMonthKey = swissTime.format(YEAR_MONTH_FORMAT)

// https://ultradashboard.republik.ch/question/506
const bucketsBefore = [
  { key: '2017-04', presale: 9703 },
  { key: '2017-05', presale: 3866 },
].reduce((summed, d) => {
  const prev = summed[summed.length - 1]
  summed.push({ ...d, preactive: d.presale + (prev ? prev.preactive : 0) })
  return summed
}, [])

const Page = ({
  data,
  t,
  me,
  actionsLoading,
  questionnaire,
  shouldBuyProlong,
  isReactivating,
  defaultBenefactor,
  router: { query, pathname },
}) => {
  const meta = {
    pageTitle: '🚀 Republik Cockpit',
    title: 'Das Cockpit zum Stand unseres Unternehmens',
    description:
      'Alles, was Sie zur finanziellen Lage der Republik wissen müssen.',
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/cockpit.jpg`,
  }

  const [isMobile, setIsMobile] = useState()
  useEffect(() => {
    if (query.token) {
      Router.replace(
        `/cockpit?token=${encodeURIComponent(query.token)}`,
        '/cockpit',
        {
          shallow: pathname === '/cockpit',
        },
      )
    }
  }, [query.token])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < mediaQueries.mBreakPoint)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <Frame meta={meta} pageColorSchemeKey='dark'>
      <Loader
        loading={data.loading || actionsLoading}
        error={data.error}
        style={{ minHeight: `calc(90vh)` }}
        render={() => {
          if (!data.membershipStats?.evolution?.buckets?.length) {
            return 'Die Cockpit-Daten konnten nicht geladen werden :('
          }

          const {
            evolution: { buckets, updatedAt },
          } = data.membershipStats
          const labels = [
            { key: 'preactive', color: '#256900', label: 'Crowdfunder' },
            {
              key: 'active',
              color: '#2ca02c',
              label: 'Aktive Mitgliedschaften oder Abos',
            },
            { key: 'loss', color: '#9467bd', label: 'Abgänge' },
            { key: 'missing', color: '#444', label: 'fehlende' },
            { key: 'pending', color: '#444', label: 'offene' },
            { key: 'base', color: '#2ca02c', label: 'bestehende' },
            {
              key: 'gaining',
              color: '#2ca02c',
              label: 'Zugänge',
            },
          ]
          const labelMap = labels.reduce((map, d) => {
            map[d.key] = d.label
            return map
          }, {})
          const colorMap = labels.reduce((map, d) => {
            map[d.label] = d.color
            return map
          }, {})

          const currentKey = formatYearMonthKey(new Date())
          const lastBucket = buckets[buckets.length - 1]
          const currentBucket =
            buckets.find((bucket) => bucket.key === currentKey) || lastBucket

          const minMaxValues = []
          const values = bucketsBefore
            .map((bucket) => ({
              month: bucket.key,
              label: labelMap.preactive,
              value: bucket.preactive,
            }))
            .concat(
              buckets
                .slice(0, -3)
                .reduce((acc, { key, active, overdue, ended }) => {
                  minMaxValues.push(active + overdue)
                  minMaxValues.push(-ended)

                  acc.push({
                    month: key,
                    label: labelMap.active,
                    value: active + overdue,
                  })
                  // acc.push({
                  //   month: key,
                  //   label: labelMap.loss,
                  //   value: -ended,
                  // })
                  return acc
                }, []),
            )

          const pendingBuckets = buckets.slice(-16, -3)
          const pendingValues = pendingBuckets.reduce(
            (agg, month) => {
              // agg.gaining += month.gaining
              // const pendingYearly =
              //   month.pending - month.pendingSubscriptionsOnly

              agg.values = agg.values.concat([
                // {
                //   month: month.key,
                //   label: labelMap.base,
                //   value: month.active - pendingYearly, // - month.gaining
                // },
                {
                  month: month.key,
                  label: labelMap.gaining,
                  value: month.gaining,
                },
                // {
                //   month: month.key,
                //   label: labelMap.pending,
                //   value: pendingYearly + month.overdue,
                // },
                {
                  month: month.key,
                  label: labelMap.loss,
                  value: -month.ended,
                },
              ])
              return agg
            },
            { gaining: 0, values: [] },
          ).values

          const activeCount = currentBucket.active + currentBucket.overdue

          /* NOV 22: WACHSTUMSZIEL vorübergehend deaktiviert
             kommt mit Wachstumskampagne zurück (JAN 23) */

          /* const missingCount = numMembersNeeded - activeCount
          if (missingCount > 0) {
            values.push({
              month: currentBucket.key,
              label: labelMap.missing,
              value: missingCount,
            })
          } */

          minMaxValues.push(numMembersNeeded)
          const [minValue, maxValue] = extent(minMaxValues).map((d, i) =>
            Math[i ? 'ceil' : 'floor'](Math.round(d / 1000) * 1000),
          )

          const lastSeenBucket =
            data.membershipStats.lastSeen.buckets.slice(-1)[0]
          const lastSeen = lastSeenBucket.users

          const engagedUsers = [].concat(
            data.discussionsStats.evolution.buckets
              .slice(0, -1)
              .map((bucket) => ({
                type: 'Dialog',
                date: bucket.key,
                value: String(bucket.users),
              })),
            // data.collectionsStats.progress.buckets
            //   .slice(0, -1)
            //   .map((bucket) => ({
            //     type: 'Lesepositionen',
            //     date: bucket.key,
            //     value: String(bucket.users),
            //   })),
            // data.collectionsStats.bookmarks.buckets
            //   .slice(0, -1)
            //   .map((bucket) => ({
            //     type: 'Lesezeichen',
            //     date: bucket.key,
            //     value: String(bucket.users),
            //   })),
          )

          const [pendingVlauesMin, pendingValuesMax] = extent(
            pendingValues,
            (d) => d.value,
          )
          // round min down to next 100 and max up to next 100
          const pendingValuesMinMax = [
            Math.floor(pendingVlauesMin / 100) * 100,
            Math.ceil(pendingValuesMax / 100) * 100,
          ]

          return (
            <>
              <Interaction.Headline style={{ marginBottom: 20 }}>
                Das Cockpit zum Stand unseres Unternehmens
              </Interaction.Headline>
              <div className={styles.structuredText}>
                <StructuredText data={data.cockpit.intro} />
              </div>
              <div style={{ margin: '60px 0' }}>
                <RawStatus
                  t={t}
                  color='#fff'
                  barColor='#333'
                  memberships
                  hasEnd={false}
                  crowdfundingName='PERMANENT'
                  crowdfunding={
                    currentBucket && {
                      name: 'PERMANENT',
                      goals: [
                        {
                          memberships: numMembersNeeded,
                        },
                      ],
                      status: {
                        memberships: activeCount,
                        lastSeen,
                      },
                    }
                  }
                />
              </div>
              <div className={styles.structuredText}>
                <StructuredText data={data.cockpit.ourCommunity} />
              </div>
              <div style={{ marginTop: 20 }}>
                <ChartTitle>
                  Aktuell {countFormat(activeCount)} Mitglieder
                  und&nbsp;Abonnentinnen
                </ChartTitle>
                <ChartLead>Entwicklung seit Januar 2018 bis heute</ChartLead>
                <Chart
                  config={{
                    type: 'Line',
                    color: 'label',
                    colorMap,
                    numberFormat: 's',
                    x: 'month',
                    timeParse: '%Y-%m',
                    timeFormat: '%Y',
                    xInterval: 'month',
                    xTicks: [
                      '2018-01',
                      '2019-01',
                      '2020-01',
                      '2021-01',
                      '2022-01',
                      '2023-01',
                      '2024-01',
                      '2025-01',
                    ],
                    height: 300,
                    domain: [0, 35000],
                    yTicks: [0, 5000, 10000, 15000, 20000, 25000, 30000, 35000],
                    endLabel: false,
                    endValue: false,
                    colorLegend: false,
                    padding: 0,
                    zero: true,
                    yNice: 0,
                  }}
                  values={values
                    .filter((d) => d.month > '2018-01')
                    .map((d) => ({ ...d, value: String(d.value) }))}
                />
              </div>
              <div className={styles.structuredText}>
                <StructuredText data={data.cockpit.membershipsCountChart} />
              </div>
              <div style={{ marginTop: 20 }}>
                <ChartTitle>
                  {/* {countFormat(
                    lastBucket.pending - lastBucket.pendingSubscriptionsOnly,
                  )}{' '}
                  anstehende Verläng&shy;erungen in den nächsten&nbsp;Monaten */}
                  {countFormat(currentBucket.gaining)} Zugänge und{' '}
                  {countFormat(currentBucket.ended)} Abgänge im laufenden Monat
                </ChartTitle>
                <ChartLead>
                  Anzahl neue und beendete Mitgliedschaften und Abos pro Monat
                </ChartLead>
                <Chart
                  config={{
                    type: 'TimeBar',
                    color: 'label',
                    colorMap,
                    numberFormat: 's',
                    x: 'month',
                    timeParse: '%Y-%m',
                    timeFormat: '%b %y',
                    xInterval: 'month',
                    height: 360,
                    domain: pendingValuesMinMax,
                    yTicks: getChartTicks(
                      pendingValuesMinMax[0],
                      pendingValuesMinMax[1],
                      250,
                    ),
                    // [
                    // -2000, -1750, -1500, -1250, -1000, -750, -500, -250, 0,
                    // 250, 500, 750, 1000, 1250, 1500, 1750, 2000,
                    // ],
                    // xAnnotations: [
                    //   {
                    //     x1: currentBucket.key,
                    //     x2: currentBucket.key,
                    //     value: activeCount,
                    //     label: 'Stand jetzt',
                    //   },
                    // ],
                  }}
                  values={pendingValues.map((d) => ({
                    ...d,
                    value: String(d.value),
                  }))}
                />
                <ChartLegend>
                  Datenstand: {formatDateTime(new Date(updatedAt))}
                </ChartLegend>
              </div>
              <div className={styles.structuredText}>
                <StructuredText data={data.cockpit.membershipsChangeChart} />
              </div>
              <H2>
                {countFormat(lastSeen)} Verlegerinnen sind monatlich&nbsp;aktiv
              </H2>
              <div className={styles.structuredText}>
                <StructuredText data={data.cockpit.activeMembers} />
              </div>

              <div style={{ marginTop: 20 }}>
                <ChartTitle>
                  Wie viele Verlegerinnen beteiligen sich am Dialog
                </ChartTitle>
                <ChartLead>
                  Anzahl Schreibende und Reagierende (Up- und Downvotes)
                </ChartLead>
                <Chart
                  config={{
                    type: 'Line',
                    sort: 'none',
                    color: 'type',
                    colorSort: 'none',
                    numberFormat: 's',
                    x: 'date',
                    timeParse: '%Y-%m',
                    timeFormat: '%Y',
                    endLabel: false,
                    colorLegend: false,
                    xTicks: isMobile
                      ? ['2018-01', '2020-01', '2022-01']
                      : [
                          '2018-01',
                          '2019-01',
                          '2020-01',
                          '2021-01',
                          '2022-01',
                          '2023-01',
                          '2024-01',
                        ], // lastSeenBucket.key
                    yNice: 0,
                    yTicks: [0, 1000, 2000, 3000, 4000, 5000],
                    colorMap: {
                      Lesepositionen: '#9467bd',
                      Lesezeichen: '#e377c2',
                      Dialog: '#2ca02c',
                    },
                  }}
                  values={engagedUsers}
                />
              </div>
              <H2>{countFormat(activeCount)} sind dabei.</H2>
              <LazyLoad>
                <TestimonialList
                  ssr={false}
                  singleRow
                  minColumns={3}
                  share={false}
                />
              </LazyLoad>
              <br />
              <P>
                <Editorial.A href='/community'>Alle anschauen</Editorial.A>
                {me && me.activeMembership ? (
                  <>
                    {'\u00a0– '}
                    <Editorial.A href='/einrichten'>
                      Ihr Profil einrichten
                    </Editorial.A>
                  </>
                ) : (
                  ''
                )}
              </P>
              <br />
              <br />
            </>
          )
        }}
      />
    </Frame>
  )
}

const EnhancedPage = compose(withT, withMe, withRouter, withInNativeApp)(Page)

export default EnhancedPage

export const getStaticProps = createGetStaticProps(
  async (client, { draftMode, params }) => {
    const currentMonth = timeMonth.floor(new Date())
    const [apiData, datoCMSData] = await Promise.all([
      client.query({
        query: statusQuery,
        variables: {
          prev: formatYearMonthKey(timeMonth.offset(currentMonth, -1)),
          max: formatYearMonthKey(timeMonth.offset(currentMonth, 3)),
          accessToken: params?.token,
        },
        errorPolicy: 'all',
      }),
      getCMSClientBase({ draftMode }).query({
        query: CockpitDocument,
      }),
    ])

    return {
      props: {
        data: {
          ...apiData.data,
          ...datoCMSData.data,
        },
        draftMode: draftMode ?? false,
      },
      revalidate: COCKPIT_PAGE_SSG_REVALIDATE,
    }
  },
)
