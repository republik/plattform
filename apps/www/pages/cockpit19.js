import { Fragment, useEffect, useState } from 'react'
import compose from 'lodash/flowRight'
import Router, { withRouter } from 'next/router'
import { max } from 'd3-array'

import {
  P,
  H2,
  H1,
  Button,
  Editorial,
  Interaction,
  Loader,
  colors,
  VideoPlayer,
  FigureImage,
  FigureCaption,
  fontStyles,
  ChartTitle,
  ChartLead,
  ChartLegend,
  Chart,
} from '@project-r/styleguide'

import Frame from '../components/Frame'
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
import { withDefaultSSR } from '../lib/apollo/helpers'

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
        Gespr??chsrunde vom 8. Januar 2020 im Rothaus
        {', '}
        <Editorial.A href='https://www.republik.ch/2020/01/11/zur-lage-der-republik'>
          ??bersicht der Fragen
        </Editorial.A>
      </>
    ),
    title: 'Gespr??chsrunde',
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
            <strong>So k??nnen Sie uns jetzt unterst??tzen:</strong>
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
                  title={isReactivating ? 'Zur??ckkehren' : undefined}
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
                      ? 'Grossz??gig zur??ckkehren'
                      : 'Grossz??gig verl??ngern'
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
                  title={defaultBenefactor ? 'G??nner bleiben' : 'G??nner werden'}
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
              verl??ngern.
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
      text = isReactivating ? 'Zur??ckkehren' : 'Treu bleiben'
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
      text = 'Ich m??chte der Republik helfen.'
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
    pageTitle: '???? Republik Cockpit',
    title: 'Wir k??mpfen f??r die Zukunft der Republik. K??mpfen Sie mit?',
    description:
      'Alles, was Sie zur Lage des Unternehmens wissen m??ssen ??? und wie Sie uns jetzt helfen k??nnen.',
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
                <>
                  <P>
                    {t('cockpit19/beforeNote')}{' '}
                    {
                      <Link href='/cockpit' passHref>
                        <Editorial.A>
                          {t('cockpit19/beforeNote/link')}
                        </Editorial.A>
                      </Link>
                    }
                  </P>
                </>
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
              <H1>
                Die Republik braucht Ihre Unterst??tzung, Ihren Mut und Ihren
                Einsatz, damit sie in Zukunft bestehen kann!
              </H1>
              <Accordion
                me={me}
                query={query}
                shouldBuyProlong={shouldBuyProlong}
                isReactivating={isReactivating}
                defaultBenefactor={defaultBenefactor}
                questionnaire={questionnaire}
              />
              <H2>Unsere Verlegerinnen ??? Sie!</H2>
              <TestimonialList
                seed={communitySeed.start}
                membershipAfter={END_DATE}
                singleRow
                minColumns={3}
                share={false}
              />
              <br />
              <P>
                Seit zwei Jahren ist die Republik jetzt da ??? als digitales
                Magazin, als Labor f??r den Journalismus des 21. Jahrhunderts.
              </P>

              <P>
                Sie haben uns bis hierhin begleitet: mit Ihrer Neugier, Ihrer
                Unterst??tzung, Ihrem Lob und Ihrer Kritik. Daf??r ein grosses
                Danke! Ohne Sie w??ren wir nicht hier.
              </P>

              <P>
                Die Aufgabe der Republik ist, brauchbaren Journalismus zu
                machen. Einen, der die K??pfe klarer, das Handeln mutiger, die
                Entscheidungen kl??ger macht. Und der das Gemeinsame st??rkt: die
                Freiheit, den Rechtsstaat, die Demokratie.
              </P>

              <P>
                Daf??r haben wir eine funktionierende Redaktion aufgebaut, die
                ordentlichen und immer ??fter auch ausserordentlichen
                Journalismus liefert und sich weiterentwickeln will. Was wir
                leider noch nicht geschafft haben: ein funktionierendes
                Gesch??ftsmodell f??r diesen werbefreien, unabh??ngigen,
                leserfinanzierten Journalismus zu etablieren.
              </P>

              <P>
                Wir sind ??berzeugt, dass unsere Existenz einen Unterschied
                machen kann. Deshalb k??mpfen wir f??r die Republik.{' '}
                <PrimaryCTA
                  me={me}
                  query={query}
                  questionnaire={questionnaire}
                  shouldBuyProlong={shouldBuyProlong}
                  isReactivating={isReactivating}
                >
                  <Editorial.A style={{ color: colors.negative.text }}>
                    K??mpfen Sie mit.
                  </Editorial.A>
                </PrimaryCTA>
              </P>

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

              <H2>Darum geht es</H2>

              <P>
                Die Republik hatte 2019 im Schnitt 18???220 Verlegerinnen. Das
                deckt 70 Prozent der Kosten. Die restlichen 30 Prozent reissen
                ein tiefes Loch in die Bilanz. Defizite sind in der Aufbauphase
                eines Start-ups normal. Ein wachsendes Defizit ist f??r ein
                junges Unternehmen aber schnell t??dlich.
              </P>

              <P>
                Im vergangenen Jahr haben wir weniger neue Verlegerinnen
                dazugewonnen, als uns verlassen haben. Oder anders: Wir haben
                unser Budgetziel verfehlt. Das hat heftige Folgen: Bis Ende M??rz
                m??ssen wir den R??ckstand von 2019 aufholen, sonst hat die
                Republik keine Zukunft.
              </P>

              <P>
                Konkret brauchen wir bis Ende M??rz wieder 19???000 Mitglieder und
                Abonnenten und zus??tzlich 2,2 Millionen Franken an
                Investoren??geldern, Spenden und F??rder??beitr??gen. Schaffen wir
                das nicht, werden wir die Republik ab dem 31. M??rz 2020
                abwickeln. Schaffen wir es, haben wir eine realistische Chance,
                langfristig ein tragf??higes Gesch??fts??modell zu etablieren.
              </P>

              <H2> Updates </H2>

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
              <P>
                <em style={{ ...fontStyles.serifItalic }}>
                  17.03.2020, 7-Uhr-Newsletter
                </em>
                <br />
                <Editorial.A href='https://www.republik.ch/2020/03/17/7-uhr-newsletter'>
                  Gemeinsam haben wir die Ziele erreicht. Danke!
                </Editorial.A>
              </P>
              <P>
                <em style={{ ...fontStyles.serifItalic }}>
                  01.03.2020, Project-R-Newsletter
                </em>
                <br />
                <Editorial.A href='https://project-r.construction/newsletter/2020-03-01-wachstum'>
                  Ein Wachstumsschub f??r die Zukunft der Republik
                </Editorial.A>
              </P>
              <P>
                <em style={{ ...fontStyles.serifItalic }}>
                  15.02.2020, Experiment 2
                </em>
                <br />
                <Editorial.A href='https://www.republik.ch/2020/02/15/schon-gehoert-eine-woche-republik-in-zehn-minuten'>
                  Eine Woche Republik in 10 Minuten
                </Editorial.A>
              </P>
              <P>
                <em style={{ ...fontStyles.serifItalic }}>
                  07.02.2020, Experiment 1
                </em>
                <br />
                <Editorial.A href='https://www.republik.ch/2020/02/07/die-welt-ist-voll-mit-gutem-journalismus-teilen-sie-ihn-mit-der-community'>
                  Ein ??Zettelbrett?? f??r journalistische Glanzst??cke
                </Editorial.A>
              </P>
              <P>
                <em style={{ ...fontStyles.serifItalic }}>
                  04.02.2020, Project-R-Newsletter
                </em>
                <br />
                <Editorial.A href='https://project-r.construction/newsletter/2020-02-04-75-prozent'>
                  Danke f??r 75 Prozent!
                </Editorial.A>
              </P>
              <P>
                <em style={{ ...fontStyles.serifItalic }}>
                  12.01.2020, Project-R-Newsletter
                </em>
                <br />
                <Editorial.A href='https://project-r.construction/newsletter/2020-01-12-zustand'>
                  Das Update zum Zustand der Republik
                </Editorial.A>
              </P>
              <P>
                <em style={{ ...fontStyles.serifItalic }}>
                  11.01.2020, Gespr??chsrunde im Rothaus:
                </em>
                <br />
                <Editorial.A href='https://www.republik.ch/2020/01/11/zur-lage-der-republik'>
                  ??Ihr braucht mehr Einnahmen. Woher sollen die kommen???
                </Editorial.A>
              </P>
              <P>
                <em style={{ ...fontStyles.serifItalic }}>
                  24.12.2019, R??ckmeldungen:
                </em>
                <br />
                <Editorial.A href='https://www.republik.ch/2019/12/24/was-wir-gehoert-haben'>
                  Was wir geh??rt haben
                </Editorial.A>
              </P>
              <P>
                <em style={{ ...fontStyles.serifItalic }}>
                  09.12.2019, Fragen und Antworten:
                </em>
                <br />
                <Editorial.A href='https://www.republik.ch/2019/12/09/lage-der-republik'>
                  Was Sie zur Lage der Republik wissen m??ssen
                </Editorial.A>
              </P>
              <P>
                <em style={{ ...fontStyles.serifItalic }}>
                  09.12.2019, Project-R-Newsletter
                </em>
                <br />
                <Editorial.A href='https://project-r.construction/newsletter/2019-12-09-der-wichtigste-newsletter'>
                  Der wichtigste Newsletter seit dem Start der Republik
                </Editorial.A>
              </P>

              <P>
                {(shouldBuyProlong || !me || !me.activeMembership) && (
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
                          ? 'Jetzt zur??ckkehren'
                          : 'Jetzt verl??ngern'
                        : 'Mitglied werden'}
                    </Button>
                  </PrimaryCTA>
                )}
              </P>

              <H2>Ohne Sie k??nnen wir nicht wachsen</H2>

              <P>
                Wir brauchen Reichweite. Die k??nnen wir uns jedoch weder kaufen
                (zu teuer) noch allein mit Journalismus erarbeiten.
              </P>

              <P>
                Wir setzen also auf unsere wichtigste Ressource: Sie. Sie ??? und
                Ihr Adressbuch, Ihr Netzwerk, Ihre Begeisterung, Ihre Skepsis.
              </P>

              <P>
                Bis Ende M??rz werden wir eine Kampagne machen m??ssen, in der Sie
                als Multiplikatoren, Botschafterinnen, Komplizen ??? nennen Sie
                es, wie Sie wollen ??? eine Hauptrolle spielen.
              </P>

              <P>
                Unser Job dabei ist, Sie regelm??ssig, offen und klar ??ber den
                Stand der Dinge zu informieren. Und Ihnen die besten Werkzeuge
                in die Hand zu geben: Argumente, Flyer, Mailkanonen ??? kurz:
                Propaganda??material.
              </P>

              <P>
                Falls Sie sich vorstellen k??nnen, dabei zu sein, haben wir ein
                kleines Formular f??r Sie vorbereitet. Es auszuf??llen, braucht
                genau eine Minute. Wir sind Ihnen dankbar, wenn Sie sich diese
                Minute nehmen.
              </P>

              <P>
                {questionnaire && questionnaire.userHasSubmitted ? (
                  'Vielen Dank f??rs Ausf??llen.'
                ) : questionnaire && questionnaire.hasEnded ? (
                  'Nicht mehr verf??gbar.'
                ) : (
                  <Link href='/umfrage/1-minute' passHref>
                    <Editorial.A>Komplizin werden</Editorial.A>
                  </Link>
                )}
              </P>

              <div style={{ width: '50%', margin: '20px 0' }}>
                <FigureImage
                  {...FigureImage.utils.getResizedSrcs(
                    `${CDN_FRONTEND_BASE_URL}/static/video/cockpit/swag.jpg`,
                    405,
                  )}
                  alt='Flyer, Visitenkarten, Kleber und Poster'
                />
              </div>

              <P>
                F??r die Bekanntmachung der Republik k??nnen Sie bei uns Flyer,
                Probeabo-K??rtchen, Sticker und Plakate bestellen. Es w??re uns
                eine Ehre, wenn Sie die Republik bekannter machen.
              </P>

              <Button
                style={{ marginTop: 20 }}
                href='https://docs.google.com/forms/d/e/1FAIpQLScV8mIr0mllc5ImdNUZg6xYV0rV8zy2sAVThVXAS1nA4oTJVw/viewform'
                primary
              >
                Material anfordern
              </Button>

              <Editorial.Note>
                Die Bestellungen laufen ??ber ein Google-Formular und werden von
                Z??riwerk verschickt.
              </Editorial.Note>

              <div style={{ marginTop: 20 }}>
                <ChartTitle>
                  Die entscheidende Frage: Wie gross ist die
                  Republik-Verlegerschaft per 31.{'\u00a0'}M??rz?
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
                        label: 'Ziel per 31. M??rz',
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
                          //   action: 'Abg??nge',
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
                  Als offen gelten Jahres??mitgliedschaften ohne
                  Verl??ngerungszahlung. Als neue gelten alle die nach dem 1.
                  Dezember an Bord gekommen sind. Datenstand:{' '}
                  {formatDateTime(new Date(evolution.updatedAt))}
                </ChartLegend>
              </div>
              <H2>Gemeinsam sind wir weit gekommen</H2>

              <P>Abgesehen von den Finanzen war 2019 ein gutes Jahr:</P>

              <Editorial.UL>
                <Editorial.LI>
                  Wir haben mit Recherchen einen{' '}
                  <Editorial.A href='/2019'>
                    entscheidenden Unterschied gemacht
                  </Editorial.A>
                </Editorial.LI>
                <Editorial.LI>
                  Wir haben die Redaktion so weiterentwickelt, dass sie beides
                  kann: schnell auf wichtige Ereignisse reagieren und
                  Hintergrund liefern.
                </Editorial.LI>
                <Editorial.LI>
                  Wir haben die Themen??f??hrerschaft in den Bereichen Justiz,
                  Digitalisierung und Klimapolitik aufgebaut.
                </Editorial.LI>
                <Editorial.LI>
                  Wir waren permanent im Dialog mit Ihnen. Bei keinem anderen
                  Medium k??nnen Sie direkt mit den Autorinnen debattieren.
                </Editorial.LI>
                <Editorial.LI>
                  Wir reflektieren wie kein anderes Medien??unternehmen die
                  eigene Arbeit ??ffentlich und schaffen Transparenz dar??ber, wie
                  wir uns entwickeln.
                </Editorial.LI>
                <Editorial.LI>
                  Wir haben Nachwuchs ausgebildet ??? und was f??r einen!
                </Editorial.LI>
                <Editorial.LI>
                  Wir waren f??r den deutschen Grimme Online Award nominiert. Wir
                  haben den Schweizer Reporterpreis und den Preis als European
                  Start-up of the Year gewonnen. Und wir sind laut einer Umfrage
                  das ??unverwechselbarste Medium der Schweiz??.
                </Editorial.LI>
                <Editorial.LI>
                  Wir haben seit einem Jahr ein starkes Gremium im R??cken, das
                  uns tr??gt, unterst??tzt ??? und konstruktiv kritisiert: den
                  Genossenschaftsrat.
                </Editorial.LI>
              </Editorial.UL>
              <H2>Die drei Phasen bis Ende M??rz</H2>
              <P>
                Gemeinsam haben wir drei nicht ganz einfache Dinge zu erledigen:
              </P>
              <P>
                ???{' '}
                <strong style={{ ...fontStyles.serifBold }}>
                  Bis Ende Januar
                </strong>
              </P>

              <P>
                ??? Dass m??glichst viele Verlegerinnen trotz Risiko an Bord
                bleiben.
              </P>

              <P>
                ??? Dass m??glichst viele von Ihnen auf den doppelten
                Mitgliedschaftspreis aufstocken. Denn was bringt Leben in
                Projekte? Grossz??gigkeit und Geld.
              </P>

              <P>
                ??? Neue unerschrockene Investorinnen und Grossspender finden.
                (Falls Sie investieren wollen, schreiben Sie an: {''}
                <Editorial.A href='mailto:ir@republik.ch'>
                  ir@republik.ch
                </Editorial.A>
                )
              </P>

              <P>
                ???{' '}
                <strong style={{ ...fontStyles.serifBold }}>Im Februar</strong>{' '}
                wollen wir an ein paar Schrauben drehen, bevor wir in den
                entscheidenden Monat gehen. Wir wollen die Republik nicht neu
                erfinden. Aber sie gemeinsam mit Ihnen noch ein wenig
                n??tzlicher, transparenter und interaktiver machen.
              </P>

              <P>
                ??? <strong style={{ ...fontStyles.serifBold }}>Im M??rz</strong>{' '}
                werden wir mit einer grossen und lauten Kampagne ein paar
                tausend neue Verlegerinnen gewinnen m??ssen. Jetzt geht es um:
                Wachstum.
              </P>

              <P>
                Wir freuen uns, wenn Sie Seite an Seite mit uns f??r die Zukunft
                der Republik k??mpfen.
              </P>
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
              <H2>
                {countFormat(
                  lastMonth.activeEndOfMonth +
                    lastMonth.pendingSubscriptionsOnly,
                )}{' '}
                sind dabei.
              </H2>
              <TestimonialList
                seed={communitySeed.end}
                membershipAfter={END_DATE}
                ssr={false}
                singleRow
                minColumns={3}
                share={false}
              />
              <br />
              <P>
                <Editorial.A href='/community'>Alle anschauen</Editorial.A>
                {me && me.activeMembership ? (
                  <>
                    {'\u00a0??? '}
                    <Editorial.A
                      style={{ color: colors.negative.text }}
                      href='/einrichten'
                    >
                      Ihr Profil einrichten
                    </Editorial.A>
                  </>
                ) : (
                  ''
                )}
              </P>
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
