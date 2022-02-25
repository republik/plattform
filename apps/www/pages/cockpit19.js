import React, { Fragment, useEffect, useState } from 'react'
import compose from 'lodash/flowRight'
import Router, { withRouter } from 'next/router'
import { max } from 'd3-array'

import {
  Button,
  Editorial,
  Interaction,
  Loader,
  colors,
  VideoPlayer,
  FigureImage,
  FigureCaption,
  fontStyles,
} from '@project-r/styleguide'
import {
  ChartTitle,
  ChartLead,
  ChartLegend,
  Chart,
} from '@project-r/styleguide'

import md from 'markdown-in-js'

import Frame from '../components/Frame'
import { light as mdComponents } from '../lib/utils/mdComponents'
import { countFormat } from '../lib/utils/format'

import { PackageItem, PackageBuffer } from '../components/Pledge/Accordion'

import withSurviveStatus, {
  withSurviveActions,
} from '../components/Crowdfunding/withSurviveStatus'
import { RawStatus } from '../components/Crowdfunding/Status'
import withT from '../lib/withT'

import {
  ListWithQuery as TestimonialList,
  generateSeed,
} from '../components/Testimonial/List'

import { CROWDFUNDING, CDN_FRONTEND_BASE_URL } from '../lib/constants'
import withMe from '../lib/apollo/withMe'
import { swissTime } from '../lib/utils/format'
import withInNativeApp from '../lib/withInNativeApp'
import Link from 'next/link'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'

const END_DATE = '2020-03-31T10:00:00.000Z'

const formatDateTime = swissTime.format('%d.%m.%Y %H:%M')

const YEAR_MONTH_FORMAT = '%Y-%m'

const videos = [
  {
    hls: 'https://player.vimeo.com/external/388987697.m3u8?s=8c23d87742613a058d6934b0631f6e33075a4b65',
    mp4: 'https://player.vimeo.com/external/388987697.hd.mp4?s=696f80ae1ac1a950dbf3652ef7a28e8f7ffdca5c&profile_id=175',
    thumbnail: `${CDN_FRONTEND_BASE_URL}/static/video/cockpit/status_feb.jpg`,
    caption: 'Statusmeldung Anfang Februar',
    title: 'Februar Status',
    duration: '2 Minuten',
  },
  {
    hls: 'https://player.vimeo.com/external/383482958.m3u8?s=5068dc339a5bc2b819ca2f3fc0b97660656c746b',
    mp4: 'https://player.vimeo.com/external/383482958.hd.mp4?s=9c0f53b63b0a1851bc401fd60fb7d2e8f31c0319&profile_id=175',
    thumbnail: `${CDN_FRONTEND_BASE_URL}/static/video/cockpit/status.jpg`,
    caption: 'Statusmeldung Anfang Januar aus dem Rothaus',
    title: 'Januar Status',
    duration: '2 Minuten',
  },
  {
    hls: 'https://player.vimeo.com/external/384007770.m3u8?s=c482cb6edf4b5a6fa2ba3bb5a68564f932889db2',
    mp4: 'https://player.vimeo.com/external/384007770.hd.mp4?s=98e5b8f524fd43ca773d8db99a73673713b122e4&profile_id=174',
    thumbnail: `${CDN_FRONTEND_BASE_URL}/static/video/cockpit/talk.jpg`,
    caption: (
      <>
        Gesprächsrunde vom 8. Januar 2020 im Rothaus
        {', '}
        <Editorial.A href='https://www.republik.ch/2020/01/11/zur-lage-der-republik'>
          Übersicht der Fragen
        </Editorial.A>
      </>
    ),
    title: 'Gesprächsrunde',
    duration: '53 Minuten',
  },
]

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
        return <br />
      }

      return (
        <div style={{ marginTop: 10, marginBottom: 30 }}>
          <Interaction.P style={{ marginBottom: 10 }}>
            <strong>So können Sie uns jetzt unterstützen:</strong>
          </Interaction.P>
          {shouldBuyProlong ? (
            <>
              <Link
                href={{
                  pathname: '/angebote',
                  query: { package: 'PROLONG', token: query.token },
                }}
                passHref
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
              >
                <PackageItem
                  t={t}
                  crowdfundingName={CROWDFUNDING}
                  name='PROLONG-BEN'
                  hover={hover}
                  setHover={setHover}
                  title={defaultBenefactor ? 'Gönner bleiben' : 'Gönner werden'}
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
          {!me && !shouldBuyProlong && !inNativeIOSApp && (
            <Interaction.P style={{ marginTop: 10 }}>
              Falls Sie bereits Mitglied sind: Melden Sie sich an, um Ihr Abo zu
              verlängern.
            </Interaction.P>
          )}
        </div>
      )
    },
  ),
)

const PrimaryCTA = withInNativeApp(
  ({
    me,
    questionnaire,
    shouldBuyProlong,
    isReactivating,
    block,
    query,
    children,
    inNativeIOSApp,
  }) => {
    if (inNativeIOSApp) {
      return null
    }

    let href
    let text
    if (shouldBuyProlong) {
      href = {
        pathname: '/angebote',
        query: { package: 'PROLONG', token: query.token },
      }
      text = isReactivating ? 'Zurückkehren' : 'Treu bleiben'
    } else if (!(me && me.activeMembership)) {
      href = {
        pathname: '/angebote',
        query: { package: 'ABO' },
      }
      text = 'Mitglied werden'
    } else if (questionnaire && questionnaire.shouldAnswer) {
      href = {
        pathname: 'umfrage/1-minute',
        query: { slug: '1-minute' },
      }
      text = 'Ich möchte der Republik helfen.'
    } else {
      return null
    }
    if (children) {
      return (
        <Link href={href} passHref>
          {children}
        </Link>
      )
    }
    return (
      <Link href={href} passHref>
        <Button primary block={block}>
          {text}
        </Button>
      </Link>
    )
  },
)

const Page = ({
  surviveData,
  t,
  me,
  inNativeIOSApp,
  actionsLoading,
  questionnaire,
  shouldBuyProlong,
  isReactivating,
  defaultBenefactor,
  communitySeed,
  crowdfunding,
  router: { query },
}) => {
  const meta = {
    pageTitle: '🚀 Republik Cockpit',
    title: 'Wir kämpfen für die Zukunft der Republik. Kämpfen Sie mit?',
    description:
      'Alles, was Sie zur Lage des Unternehmens wissen müssen – und wie Sie uns jetzt helfen können.',
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/cockpit.jpg`,
  }

  useEffect(() => {
    if (query.token) {
      Router.replace(
        `/cockpit?token=${encodeURIComponent(query.token)}`,
        '/cockpit',
        {
          shallow: true,
        },
      )
    }
  }, [query.token])
  const [activeVideo, setActiveVideo] = useState(videos[0])
  const [autoPlay, setAutoPlay] = useState(false)

  return (
    <Frame meta={meta} pageColorSchemeKey='dark'>
      <Loader
        loading={surviveData.loading || actionsLoading}
        error={surviveData.error}
        style={{ minHeight: `calc(90vh)` }}
        render={() => {
          const { evolution, count } = surviveData.membershipStats
          const lastMonth = evolution.buckets[evolution.buckets.length - 1]
          const reachedMemberGoal =
            lastMonth.activeEndOfMonth + lastMonth.pendingSubscriptionsOnly >
            19000

          return (
            <>
              <div style={{ marginBottom: 60 }}>
                {md(mdComponents)`

${t('cockpit19/beforeNote')} ${(
                  <Link href='/cockpit' passHref>
                    <Editorial.A>{t('cockpit19/beforeNote/link')}</Editorial.A>
                  </Link>
                )}

                `}
                <br />
                <RawStatus
                  t={t}
                  color='#fff'
                  barColor='#333'
                  people
                  money
                  crowdfundingName={crowdfunding.name}
                  labelReplacements={{
                    openPeople: countFormat(
                      lastMonth.pending - lastMonth.pendingSubscriptionsOnly,
                    ),
                  }}
                  crowdfunding={crowdfunding}
                />
              </div>
              {md(mdComponents)`

# Die Republik braucht Ihre Unterstützung, Ihren Mut und Ihren Einsatz, damit sie in Zukunft bestehen kann!

      `}
              <Accordion
                me={me}
                query={query}
                shouldBuyProlong={shouldBuyProlong}
                isReactivating={isReactivating}
                defaultBenefactor={defaultBenefactor}
                questionnaire={questionnaire}
              />

              {md(mdComponents)`

## Unsere Verlegerinnen – Sie!`}

              <TestimonialList
                seed={communitySeed.start}
                membershipAfter={END_DATE}
                singleRow
                minColumns={3}
                share={false}
              />
              <br />

              {md(mdComponents)`

Seit zwei Jahren ist die Republik jetzt da – als digitales Magazin, als Labor für den Journalismus des 21. Jahrhunderts.

Sie haben uns bis hierhin begleitet: mit Ihrer Neugier, Ihrer Unterstützung, Ihrem Lob und Ihrer Kritik. Dafür ein grosses Danke! Ohne Sie wären wir nicht hier.

Die Aufgabe der Republik ist, brauchbaren Journalismus zu machen. Einen, der die Köpfe klarer, das Handeln mutiger, die Entscheidungen klüger macht. Und der das Gemeinsame stärkt: die Freiheit, den Rechtsstaat, die Demokratie.

Dafür haben wir eine funktionierende Redaktion aufgebaut, die ordentlichen und immer öfter auch ausserordentlichen Journalismus liefert und sich weiterentwickeln will. Was wir leider noch nicht geschafft haben: ein funktionierendes Geschäftsmodell für diesen werbefreien, unabhängigen, leserfinanzierten Journalismus zu etablieren.

Wir sind überzeugt, dass unsere Existenz einen Unterschied machen kann. Deshalb kämpfen wir für die Republik. ${(
                <PrimaryCTA
                  me={me}
                  query={query}
                  questionnaire={questionnaire}
                  shouldBuyProlong={shouldBuyProlong}
                  isReactivating={isReactivating}
                >
                  <Editorial.A style={{ color: colors.negative.text }}>
                    Kämpfen Sie mit.
                  </Editorial.A>
                </PrimaryCTA>
              )}

  `}

              {inNativeIOSApp && (
                <Interaction.P
                  style={{
                    color: '#ef4533',
                    marginBottom: 15,
                    marginTop: 15,
                  }}
                >
                  {t('cockpit/ios')}
                </Interaction.P>
              )}

              {md(mdComponents)`
## Darum geht es

Die Republik hatte 2019 im Schnitt 18’220 Verlegerinnen. Das deckt 70 Prozent der Kosten. Die restlichen 30 Prozent reissen ein tiefes Loch in die Bilanz. Defizite sind in der Aufbauphase eines Start-ups normal. Ein wachsendes Defizit ist für ein junges Unternehmen aber schnell tödlich.

Im vergangenen Jahr haben wir weniger neue Verlegerinnen dazugewonnen, als uns verlassen haben. Oder anders: Wir haben unser Budgetziel verfehlt. Das hat heftige Folgen: Bis Ende März müssen wir den Rückstand von 2019 aufholen, sonst hat die Republik keine Zukunft. 

Konkret brauchen wir bis Ende März wieder 19’000 Mitglieder und Abonnenten und zusätzlich 2,2 Millionen Franken an Investoren­geldern, Spenden und Förder­beiträgen. Schaffen wir das nicht, werden wir die Republik ab dem 31. März 2020 abwickeln. Schaffen wir es, haben wir eine realistische Chance, langfristig ein tragfähiges Geschäfts­modell zu etablieren.

## Updates


`}
              <Fragment>
                <VideoPlayer
                  key={activeVideo.hls}
                  autoPlay={autoPlay}
                  src={activeVideo}
                />
                <div style={{ marginTop: 10 }}>
                  <FigureCaption>{activeVideo.caption}</FigureCaption>
                </div>

                <div style={{ marginTop: 20, marginBottom: 20 }}>
                  {videos.map((v) => (
                    <a
                      href={v !== activeVideo ? '#' : undefined}
                      key={v.hls}
                      onClick={(e) => {
                        e.preventDefault()
                        setActiveVideo(v)
                        setAutoPlay(true)
                      }}
                      style={{
                        display: 'inline-block',
                        width: 130,
                        marginRight: 10,
                        marginBottom: 10,
                        color: '#fff',
                        verticalAlign: 'top',
                        backgroundColor:
                          v === activeVideo
                            ? colors.primary
                            : colors.negative.primaryBg,
                      }}
                    >
                      <img src={v.thumbnail} width='100%' />
                      <span
                        style={{
                          display: 'inline-block',
                          minHeight: 38,
                          padding: '2px 5px 5px',
                          ...fontStyles.sansSerifRegular12,
                        }}
                      >
                        {v.title}
                        <br />
                        {v.duration}
                      </span>
                    </a>
                  ))}
                </div>
              </Fragment>
              {md(mdComponents)`

_17.03.2020, 7-Uhr-Newsletter_  
[Gemeinsam haben wir die Ziele erreicht. Danke!](https://www.republik.ch/2020/03/17/7-uhr-newsletter)

_01.03.2020, Project-R-Newsletter_  
[Ein Wachstumsschub für die Zukunft der Republik](https://project-r.construction/newsletter/2020-03-01-wachstum)

_15.02.2020, Experiment 2_  
[Eine Woche Republik in 10 Minuten](https://www.republik.ch/2020/02/15/schon-gehoert-eine-woche-republik-in-zehn-minuten)

_07.02.2020, Experiment 1_  
[Ein «Zettelbrett» für journalistische Glanzstücke](https://www.republik.ch/2020/02/07/die-welt-ist-voll-mit-gutem-journalismus-teilen-sie-ihn-mit-der-community)

_04.02.2020, Project-R-Newsletter_  
[Danke für 75 Prozent!](https://project-r.construction/newsletter/2020-02-04-75-prozent)

_12.01.2020, Project-R-Newsletter_  
[Das Update zum Zustand der Republik](https://project-r.construction/newsletter/2020-01-12-zustand)

_11.01.2020, Gesprächsrunde im Rothaus:_  
[«Ihr braucht mehr Einnahmen. Woher sollen die kommen?»](https://www.republik.ch/2020/01/11/zur-lage-der-republik)

_24.12.2019, Rückmeldungen:_  
[Was wir gehört haben](https://www.republik.ch/2019/12/24/was-wir-gehoert-haben)

_09.12.2019, Fragen und Antworten:_  
[Was Sie zur Lage der Republik wissen müssen](https://www.republik.ch/2019/12/09/lage-der-republik)

_09.12.2019, Project-R-Newsletter_  
[Der wichtigste Newsletter seit dem Start der Republik](https://project-r.construction/newsletter/2019-12-09-der-wichtigste-newsletter)

${
  (shouldBuyProlong || !me || !me.activeMembership) && (
    <PrimaryCTA
      me={me}
      query={query}
      questionnaire={questionnaire}
      shouldBuyProlong={shouldBuyProlong}
      isReactivating={isReactivating}
    >
      <Button primary>
        {shouldBuyProlong
          ? isReactivating
            ? 'Jetzt zurückkehren'
            : 'Jetzt verlängern'
          : 'Mitglied werden'}
      </Button>
    </PrimaryCTA>
  )
}

## Ohne Sie können wir nicht wachsen

Wir brauchen Reichweite. Die können wir uns jedoch weder kaufen (zu teuer) noch allein mit Journalismus erarbeiten.

Wir setzen also auf unsere wichtigste Ressource: Sie. Sie – und Ihr Adressbuch, Ihr Netzwerk, Ihre Begeisterung, Ihre Skepsis.

Bis Ende März werden wir eine Kampagne machen müssen, in der Sie als Multiplikatoren, Botschafterinnen, Komplizen – nennen Sie es, wie Sie wollen – eine Hauptrolle spielen.

Unser Job dabei ist, Sie regelmässig, offen und klar über den Stand der Dinge zu informieren. Und Ihnen die besten Werkzeuge in die Hand zu geben: Argumente, Flyer, Mailkanonen – kurz: Propaganda­material.

Falls Sie sich vorstellen können, dabei zu sein, haben wir ein kleines Formular für Sie vorbereitet. Es auszufüllen, braucht genau eine Minute. Wir sind Ihnen dankbar, wenn Sie sich diese Minute nehmen.

${
  questionnaire && questionnaire.userHasSubmitted ? (
    'Vielen Dank fürs Ausfüllen.'
  ) : questionnaire && questionnaire.hasEnded ? (
    'Nicht mehr verfügbar.'
  ) : (
    <Link href='/umfrage/1-minute' passHref>
      <Editorial.A>Komplizin werden</Editorial.A>
    </Link>
  )
}

`}

              <div style={{ width: '50%', margin: '20px 0' }}>
                <FigureImage
                  {...FigureImage.utils.getResizedSrcs(
                    `${CDN_FRONTEND_BASE_URL}/static/video/cockpit/swag.jpg`,
                    405,
                  )}
                  alt='Flyer, Visitenkarten, Kleber und Poster'
                />
              </div>

              {md(mdComponents)`

Für die Bekanntmachung der Republik können Sie bei uns Flyer, Probeabo-Kärtchen, Sticker und Plakate bestellen. Es wäre uns eine Ehre, wenn Sie die Republik bekannter machen.

`}

              <Button
                style={{ marginTop: 20 }}
                href='https://docs.google.com/forms/d/e/1FAIpQLScV8mIr0mllc5ImdNUZg6xYV0rV8zy2sAVThVXAS1nA4oTJVw/viewform'
                primary
              >
                Material anfordern
              </Button>

              <Editorial.Note>
                Die Bestellungen laufen über ein Google-Formular und werden von
                Züriwerk verschickt.
              </Editorial.Note>

              <div style={{ marginTop: 20 }}>
                <ChartTitle>
                  Die entscheidende Frage: Wie gross ist die
                  Republik-Verlegerschaft per 31.{'\u00a0'}März?
                </ChartTitle>
                <ChartLead>
                  Anzahl bestehende, offene und neue Mitgliedschaften und
                  Monatsabos per Monatsende
                </ChartLead>
                <Chart
                  config={{
                    type: 'TimeBar',
                    color: 'action',
                    numberFormat: 's',
                    colorRange: ['#3CAD00', '#2A7A00', '#333333', '#9970ab'],
                    x: 'date',
                    timeParse: YEAR_MONTH_FORMAT,
                    timeFormat: '%b',
                    xTicks: ['2019-12', '2020-01', '2020-02', '2020-03'],
                    domain: [
                      0,
                      max(
                        evolution.buckets
                          .map(
                            (month) =>
                              month.activeEndOfMonth +
                              month.pendingSubscriptionsOnly -
                              month.gaining +
                              month.pending -
                              month.pendingSubscriptionsOnly,
                          )
                          .concat([20000, count * 1.05]),
                      ),
                    ],
                    yTicks: [0, 10000, 20000],
                    padding: 55,
                    xAnnotations: [
                      {
                        x1: '2020-03',
                        x2: '2020-03',
                        label: 'bereits dabei',
                        value:
                          lastMonth.activeEndOfMonth +
                          lastMonth.pendingSubscriptionsOnly,
                        position: reachedMemberGoal ? 'top' : 'bottom',
                      },
                      {
                        x1: '2020-03',
                        x2: '2020-03',
                        label: 'Ziel per 31. März',
                        value: 19000,
                        position: reachedMemberGoal ? 'bottom' : 'top',
                      },
                    ].filter(Boolean),
                  }}
                  values={
                    evolution.buckets.reduce(
                      (agg, month) => {
                        agg.gaining += month.gaining
                        // agg.exit += month.expired + month.cancelled
                        agg.values = agg.values.concat([
                          {
                            date: month.key,
                            action: 'bestehende',
                            value: String(
                              month.activeEndOfMonth -
                                agg.gaining +
                                month.pendingSubscriptionsOnly,
                            ),
                          },
                          {
                            date: month.key,
                            action: 'neue',
                            value: String(agg.gaining),
                          },
                          {
                            date: month.key,
                            action: 'offene',
                            value: String(
                              month.pending - month.pendingSubscriptionsOnly,
                            ),
                          },
                          // {
                          //   date: month.key,
                          //   action: 'Abgänge',
                          //   value: String(
                          //     agg.exit
                          //   )
                          // }
                        ])
                        return agg
                      },
                      { gaining: 0, exit: 0, values: [] },
                    ).values
                  }
                />
                <ChartLegend>
                  Als offen gelten Jahres­mitgliedschaften ohne
                  Verlängerungszahlung. Als neue gelten alle die nach dem 1.
                  Dezember an Bord gekommen sind. Datenstand:{' '}
                  {formatDateTime(new Date(evolution.updatedAt))}
                </ChartLegend>
              </div>

              {md(mdComponents)`
## Gemeinsam sind wir weit gekommen

Abgesehen von den Finanzen war 2019 ein gutes Jahr:

- Wir haben mit Recherchen einen [entscheidenden Unterschied gemacht](https://republik.ch/2019).

- Wir haben die Redaktion so weiterentwickelt, dass sie beides kann: schnell auf wichtige Ereignisse reagieren und Hintergrund liefern.

- Wir haben die Themen­führerschaft in den Bereichen Justiz, Digitalisierung und Klimapolitik aufgebaut.

- Wir waren permanent im Dialog mit Ihnen. Bei keinem anderen Medium können Sie direkt mit den Autorinnen debattieren.

- Wir reflektieren wie kein anderes Medien­unternehmen die eigene Arbeit öffentlich und schaffen Transparenz darüber, wie wir uns entwickeln.

- Wir haben Nachwuchs ausgebildet – und was für einen!

- Wir waren für den deutschen Grimme Online Award nominiert. Wir haben den Schweizer Reporterpreis und den Preis als European Start-up of the Year gewonnen. Und wir sind laut einer Umfrage das «unverwechselbarste Medium der Schweiz».

- Wir haben seit einem Jahr ein starkes Gremium im Rücken, das uns trägt, unterstützt – und konstruktiv kritisiert: den Genossenschaftsrat.

## Die drei Phasen bis Ende März

Gemeinsam haben wir drei nicht ganz einfache Dinge zu erledigen:

✅ **Bis Ende Januar** 

✅ Dass möglichst viele Verlegerinnen trotz Risiko an Bord bleiben.

✅ Dass möglichst viele von Ihnen auf den doppelten Mitgliedschaftspreis aufstocken. Denn was bringt Leben in Projekte? Grosszügigkeit und Geld.

✅ Neue unerschrockene Investorinnen und Grossspender finden. (Falls Sie investieren wollen, schreiben Sie an: [ir@republik.ch](mailto:ir@republik.ch))

✅ **Im Februar** wollen wir an ein paar Schrauben drehen, bevor wir in den entscheidenden Monat gehen. Wir wollen die Republik nicht neu erfinden. Aber sie gemeinsam mit Ihnen noch ein wenig nützlicher, transparenter und interaktiver machen.

✅ **Im März** werden wir mit einer grossen und lauten Kampagne ein paar tausend neue Verlegerinnen gewinnen müssen. Jetzt geht es um: Wachstum.

Wir freuen uns, wenn Sie Seite an Seite mit uns für die Zukunft der Republik kämpfen.

`}
              <br />
              <Accordion
                me={me}
                query={query}
                shouldBuyProlong={shouldBuyProlong}
                isReactivating={isReactivating}
                defaultBenefactor={defaultBenefactor}
                questionnaire={questionnaire}
              />

              {inNativeIOSApp && (
                <Interaction.P style={{ color: '#ef4533', marginBottom: 10 }}>
                  {t('cockpit/ios')}
                </Interaction.P>
              )}

              {md(mdComponents)`



## ${countFormat(
                lastMonth.activeEndOfMonth + lastMonth.pendingSubscriptionsOnly,
              )} sind dabei.`}

              <TestimonialList
                seed={communitySeed.end}
                membershipAfter={END_DATE}
                ssr={false}
                singleRow
                minColumns={3}
                share={false}
              />
              <br />

              {md(mdComponents)`
[Alle anschauen](/community)${
                me && me.activeMembership ? (
                  <Fragment>
                    {'\u00a0– '}
                    <Editorial.A
                      style={{ color: colors.negative.text }}
                      href='/einrichten'
                    >
                      Ihr Profil einrichten
                    </Editorial.A>
                  </Fragment>
                ) : (
                  ''
                )
              }
      `}

              <br />
              <br />

              {questionnaire && questionnaire.shouldAnswer && (
                <Link href='/umfrage/1-minute' passHref>
                  <Button white block>
                    Komplizin werden
                  </Button>
                </Link>
              )}

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
  withSurviveActions,
  withSurviveStatus,
)(Page)

EnhancedPage.getInitialProps = () => {
  return {
    communitySeed: {
      start: generateSeed(),
      end: generateSeed(),
    },
  }
}

export default withDefaultSSR(EnhancedPage)
