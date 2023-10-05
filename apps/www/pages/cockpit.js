import { useEffect, useState } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import Router, { withRouter } from 'next/router'
import { extent } from 'd3-array'
import { gql } from '@apollo/client'
import { timeMonth } from 'd3-time'

import {
  P,
  H2,
  Editorial,
  Interaction,
  Loader,
  LazyLoad,
  ChartTitle,
  ChartLead,
  ChartLegend,
  Chart,
  mediaQueries,
} from '@project-r/styleguide'

import Frame from '../components/Frame'
import { countFormat } from '../lib/utils/format'

import { PackageItem, PackageBuffer } from '../components/Pledge/Accordion'

import {
  mapActionData,
  userSurviveActionsFragment,
} from '../components/Crowdfunding/withSurviveStatus'
import { RawStatus } from '../components/Crowdfunding/Status'
import withT from '../lib/withT'

import { ListWithQuery as TestimonialList } from '../components/Testimonial/List'

import { CROWDFUNDING, CDN_FRONTEND_BASE_URL } from '../lib/constants'
import withMe from '../lib/apollo/withMe'
import { swissTime } from '../lib/utils/format'
import withInNativeApp from '../lib/withInNativeApp'
import Link from 'next/link'
import { withDefaultSSR } from '../lib/apollo/helpers'

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
      ...SurviveActionsOnUser
    }
  }
  ${userSurviveActionsFragment}
`

const numMembersNeeded = 33000

const formatDateTime = swissTime.format('%d.%m.%Y %H:%M')

const YEAR_MONTH_FORMAT = '%Y-%m'
const formatYearMonthKey = swissTime.format(YEAR_MONTH_FORMAT)

const Accordion = withInNativeApp(
  withT(
    ({
      t,
      me,
      query,
      shouldBuyProlong,
      isReactivating,
      defaultBenefactor,
      inNativeIOSApp,
    }) => {
      const [hover, setHover] = useState()

      if (inNativeIOSApp) {
        return null
      }

      return (
        <div style={{ marginTop: 10, marginBottom: 30 }}>
          <Interaction.P style={{ marginBottom: 10 }}>
            <strong>So können Sie uns jetzt unterstützen:</strong>
          </Interaction.P>
          {me && me.activeMembership && (
            <>
              <Link href='/komplizin' passHref legacyBehavior>
                <PackageItem
                  t={t}
                  crowdfundingName={CROWDFUNDING}
                  name='PROMOTE'
                  title={'Republik bekannter machen'}
                  hover={hover}
                  setHover={setHover}
                />
              </Link>
            </>
          )}
          {!inNativeIOSApp && (
            <>
              {shouldBuyProlong ? (
                <>
                  <Link
                    href={{
                      pathname: '/angebote',
                      query: { package: 'PROLONG', token: query.token },
                    }}
                    passHref
                    legacyBehavior
                  >
                    <PackageItem
                      t={t}
                      crowdfundingName={CROWDFUNDING}
                      name='PROLONG'
                      title={isReactivating ? 'Zurückkehren' : undefined}
                      hover={hover}
                      setHover={setHover}
                      price={24000}
                    />
                  </Link>
                  <Link
                    href={{
                      pathname: '/angebote',
                      query: {
                        package: 'PROLONG',
                        token: query.token,
                        price: 48000,
                      },
                    }}
                    passHref
                    legacyBehavior
                  >
                    <PackageItem
                      t={t}
                      crowdfundingName={CROWDFUNDING}
                      name='PROLONG-BIG'
                      hover={hover}
                      setHover={setHover}
                      title={
                        isReactivating
                          ? 'Grosszügig zurückkehren'
                          : 'Grosszügig verlängern'
                      }
                      price={48000}
                    />
                  </Link>
                  <Link
                    href={{
                      pathname: '/angebote',
                      query: {
                        package: 'PROLONG',
                        membershipType: 'BENEFACTOR_ABO',
                        token: query.token,
                      },
                    }}
                    passHref
                    legacyBehavior
                  >
                    <PackageItem
                      t={t}
                      crowdfundingName={CROWDFUNDING}
                      name='PROLONG-BEN'
                      hover={hover}
                      setHover={setHover}
                      title={
                        defaultBenefactor ? 'Gönner bleiben' : 'Gönner werden'
                      }
                      price={100000}
                    />
                  </Link>
                </>
              ) : (
                <>
                  {me && me.activeMembership ? (
                    <Link
                      href={{
                        pathname: '/angebote',
                        query: { package: 'ABO_GIVE' },
                      }}
                      passHref
                      legacyBehavior
                    >
                      <PackageItem
                        t={t}
                        crowdfundingName={CROWDFUNDING}
                        name='ABO_GIVE'
                        hover={hover}
                        setHover={setHover}
                        price={24000}
                      />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={{
                          pathname: '/angebote',
                          query: { package: 'MONTHLY_ABO' },
                        }}
                        passHref
                        legacyBehavior
                      >
                        <PackageItem
                          t={t}
                          crowdfundingName={CROWDFUNDING}
                          name='MONTHLY_ABO'
                          hover={hover}
                          setHover={setHover}
                          price={2200}
                        />
                      </Link>
                      <Link
                        href={{
                          pathname: '/angebote',
                          query: { package: 'ABO' },
                        }}
                        passHref
                        legacyBehavior
                      >
                        <PackageItem
                          t={t}
                          crowdfundingName={CROWDFUNDING}
                          name='ABO'
                          hover={hover}
                          setHover={setHover}
                          price={24000}
                        />
                      </Link>
                      <Link
                        href={{
                          pathname: '/angebote',
                          query: { package: 'BENEFACTOR' },
                        }}
                        passHref
                        legacyBehavior
                      >
                        <PackageItem
                          t={t}
                          crowdfundingName={CROWDFUNDING}
                          name='BENEFACTOR'
                          hover={hover}
                          setHover={setHover}
                          price={100000}
                        />
                      </Link>
                    </>
                  )}
                </>
              )}
              <Link
                href={{
                  pathname: '/angebote',
                  query: { package: 'DONATE' },
                }}
                passHref
                legacyBehavior
              >
                <PackageItem
                  t={t}
                  crowdfundingName={CROWDFUNDING}
                  name='DONATE'
                  hover={hover}
                  setHover={setHover}
                />
              </Link>
              <PackageBuffer />
              {false && !me && !shouldBuyProlong && !inNativeIOSApp && (
                <Interaction.P style={{ marginTop: 10 }}>
                  Falls Sie bereits Mitglied sind: Melden Sie sich an, um Ihr
                  Abo zu verlängern.
                </Interaction.P>
              )}
            </>
          )}
          {inNativeIOSApp && (
            <Interaction.P style={{ color: '#ef4533', marginTop: 30 }}>
              {t('cockpit/ios')}
            </Interaction.P>
          )}
        </div>
      )
    },
  ),
)

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
          const {
            evolution: { buckets, updatedAt },
          } = data.membershipStats

          const labels = [
            { key: 'preactive', color: '#256900', label: 'Crowdfunder' },
            {
              key: 'active',
              color: '#3CAD00',
              label: 'Aktive Mitgliedschaften oder Abos',
            },
            { key: 'loss', color: '#9970ab', label: 'Abgänge' },
            { key: 'missing', color: '#444', label: 'fehlende' },
            { key: 'pending', color: '#444', label: 'offene' },
            { key: 'base', color: '#3CAD00', label: 'bestehende' },
            {
              key: 'gaining',
              color: '#2A7A00',
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

          console.log(data.membershipStats.lastSeen)

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

          return (
            <>
              <div style={{ marginBottom: 60 }}>
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
              <Interaction.Headline style={{ marginBottom: 20 }}>
                Das Cockpit zum Stand unseres Unternehmens
              </Interaction.Headline>
              <P>
                Die Aufgabe der Republik ist, brauchbaren Journalismus zu
                machen. Einen, der die Köpfe klarer, das Handeln mutiger, die
                Entscheidungen klüger macht. Und der das Gemeinsame stärkt: die
                Freiheit, den Rechtsstaat, die Demokratie.
              </P>
              <P>
                Die Grundlage dafür ist ein Geschäftsmodell für werbefreien,
                unabhängigen, leserfinanzierten Journalismus. Damit die Republik
                einen entscheidenden Unterschied im Mediensystem machen kann,
                muss sie mittelfristig selbsttragend sein. Um am Markt zu
                bestehen und durch Einfluss auf die gesellschaftliche Debatte
                nachhaltige Relevanz zu erreichen, muss sie jedoch auch weiter
                wachsen.
              </P>

              <div style={{ marginTop: 20 }}>
                <ChartTitle>
                  Aktuell {countFormat(activeCount)} Mitglieder
                  und&nbsp;Abonnentinnen
                </ChartTitle>
                <ChartLead>Entwicklung seit Januar 2020 bis heute</ChartLead>
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
                  Anzahl neue und beendete Mitgliedschaften und Abos per
                  Monatsende
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
                    height: 300,
                    domain: [-1500, 2500],
                    yTicks: [
                      -1500, -1000, -500, 0, 500, 1000, 1500, 2000, 2500,
                    ],
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
              <H2>
                {countFormat(lastSeen)} Verlegerinnen sind monatlich&nbsp;aktiv
              </H2>
              <P>
                Der beste Journalismus nützt nichts, wenn ihn niemand sieht. Für
                ein gesundes Unternehmen braucht es eine aktive und
                interessierte Verlegerschaft.
              </P>

              <div style={{ marginTop: 20 }}>
                <ChartTitle>
                  Wie beliebt sind Dialog, Lesezeichen und Leseposition?
                </ChartTitle>
                <ChartLead>
                  Anzahl Verleger, welche pro Monat eine Funktion benutzen. HIER
                  TITEL ETC ANPASSEN
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
                    xTicks: isMobile
                      ? ['2018-01', '2020-01', '2022-01']
                      : [
                          '2018-01',
                          '2019-01',
                          '2020-01',
                          '2021-01',
                          '2022-01',
                          '2023-01',
                        ], // lastSeenBucket.key
                    yNice: 0,
                    yTicks: [0, 1000, 2000, 3000, 4000, 5000],
                    colorMap: {
                      Lesepositionen: '#9467bd',
                      Lesezeichen: '#e377c2',
                      Dialog: '#bcbd22',
                    },
                  }}
                  values={engagedUsers}
                />
                <ChartLegend>
                  Beim Dialog werden Schreibende und Reagierende (Up- und
                  Downvotes) gezählt.
                </ChartLegend>
              </div>

              <br />
              <Accordion
                me={me}
                query={query}
                shouldBuyProlong={shouldBuyProlong}
                isReactivating={isReactivating}
                defaultBenefactor={defaultBenefactor}
                questionnaire={questionnaire}
              />
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

const EnhancedPage = compose(
  withT,
  withMe,
  withRouter,
  withInNativeApp,
  graphql(statusQuery, {
    props: ({ data, ownProps }) => {
      return {
        data,
        ...mapActionData({ data, ownProps }),
      }
    },
    options: ({ router: { query } }) => {
      const currentMonth = timeMonth.floor(new Date())
      return {
        variables: {
          prev: formatYearMonthKey(timeMonth.offset(currentMonth, -1)),
          max: formatYearMonthKey(timeMonth.offset(currentMonth, 3)),
          accessToken: query.token,
        },
      }
    },
  }),
)(Page)

export default withDefaultSSR(EnhancedPage)
