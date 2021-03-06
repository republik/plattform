import { useState, useEffect } from 'react'
import { withRouter } from 'next/router'
import { css } from 'glamor'

import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import { countFormat } from '../lib/utils/format'

import withInNativeApp from '../lib/withInNativeApp'
import withMe from '../lib/apollo/withMe'
import withT from '../lib/withT'

import Box from '../components/Frame/Box'
import Employees from '../components/Marketing/legacy/Employees'
import Frame from '../components/Frame'
import ShareButtons from '../components/ActionBar/ShareButtons'
import List, { Highlight } from '../components/List'
import { ListWithQuery as TestimonialList } from '../components/Testimonial/List'
import ContainerWithSidebar, {
  Content,
} from '../components/Crowdfunding/ContainerWithSidebar'
import withSurviveStatus, {
  userSurviveActionsFragment,
  mapActionData,
} from '../components/Crowdfunding/withSurviveStatus'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

import TeaserBlock, {
  GAP as TEASER_BLOCK_GAP,
} from '../components/Overview/TeaserBlock'
import { getTeasersFromDocument } from '../components/Overview/utils'

import {
  Loader,
  Container,
  Label,
  Button,
  Lead,
  A,
  P,
  H2,
  colors,
  Interaction,
  mediaQueries,
  LazyLoad,
  fontStyles,
  Editorial,
} from '@project-r/styleguide'
import ReasonsVideo from '../components/About/ReasonsVideo'
import Link from 'next/link'
import { withDefaultSSR } from '../lib/apollo/helpers'

const query = gql`
  query cf2($accessToken: ID) {
    front: document(path: "/") {
      id
      children(first: 60) {
        nodes {
          body
        }
      }
    }
    employees(withBoosted: true, shuffle: 50) {
      title
      name
      group
      subgroup
      user {
        id
        portrait
        slug
      }
    }
    actionMe: me(accessToken: $accessToken) {
      id
      ...SurviveActionsOnUser
    }
  }
  ${userSurviveActionsFragment}
`

const styles = {
  overviewOverflow: css({
    overflow: 'hidden',

    paddingTop: 420,
    marginTop: -400,
    marginBottom: 20,
  }),
  overviewContainer: css({
    position: 'relative',
    zIndex: 1,
    padding: '30px 0 0',
    backgroundColor: colors.negative.containerBg,
    color: colors.negative.text,
  }),
  overviewBottomShadow: css({
    position: 'absolute',
    bottom: 0,
    height: 100,
    left: 0,
    right: 0,
    background:
      'linear-gradient(0deg, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.8) 30%, rgba(17,17,17,0) 100%)',
    pointerEvents: 'none',
  }),
  overviewTopShadow: css({
    position: 'absolute',
    top: 100,
    height: 350,
    zIndex: 2,
    left: 0,
    right: 0,
    background:
      'linear-gradient(180deg, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.8) 67%, rgba(17,17,17,0) 100%)',
    pointerEvents: 'none',
    [mediaQueries.mUp]: {
      display: 'none',
    },
  }),
  stretchLead: css({
    margin: '20px 0 0',
  }),
  stretchP: css({
    fontSize: 17,
    lineHeight: '25px',
  }),
  cards: css({
    position: 'relative',
    zIndex: 1,
    background: colors.light.defaultInverted,
    margin: '30px 0',
    [mediaQueries.mUp]: {
      margin: '50px 0',
    },
  }),
  tnum: css({
    fontFeatureSettings: '"tnum" 1, "kern" 1',
  }),
}

const Page = ({
  crowdfunding,
  data,
  shouldBuyProlong,
  inNativeIOSApp,
  isReactivating,
  defaultBenefactor,
  activeMembership,
  actionsLoading,
  t,
  router,
}) => {
  const { query } = router
  useEffect(() => {
    if (query.token) {
      router.replace(
        `/maerzkampagne?token=${encodeURIComponent(query.token)}`,
        '/maerzkampagne',
        {
          shallow: true,
        },
      )
    }
  }, [query.token])

  const [highlight, setHighlight] = useState()
  // ensure the highlighFunction is not dedected as an state update function
  const onHighlight = (highlighFunction) => setHighlight(() => highlighFunction)

  const tokenParams = query.token ? { token: query.token } : {}
  const primaryQuery = shouldBuyProlong
    ? { package: 'PROLONG', ...tokenParams }
    : activeMembership
    ? undefined
    : { package: 'ABO' }
  const pledgeLink =
    inNativeIOSApp || !primaryQuery ? null : (
      <Link href={{ pathname: '/angebote', query: primaryQuery }} passHref>
        <A>
          {activeMembership && !shouldBuyProlong
            ? 'Wachstum schenken'
            : 'Jetzt mitmachen!'}
        </A>
      </Link>
    )

  const links = [
    !activeMembership && {
      href: {
        pathname: '/angebote',
        query: { package: 'ABO', userPrice: 1 },
      },
      text: 'Sie k??nnen sich den Betrag nicht leisten?',
    },
    {
      href: `mailto:ir@republik.ch?subject=${encodeURIComponent(
        'Investitionsm??glichkeiten bei der Republik AG',
      )}`,
      text: 'Sie wollen investieren?',
    },
  ].filter(Boolean)
  const packages = actionsLoading
    ? []
    : shouldBuyProlong
    ? [
        {
          name: 'PROLONG',
          title: isReactivating ? 'Zur??ckkehren' : 'Verl??ngern',
          params: tokenParams,
          price: 24000,
        },
        {
          name: 'PROLONG-BEN',
          params: {
            package: 'PROLONG',
            membershipType: 'BENEFACTOR_ABO',
            ...tokenParams,
          },
          title: defaultBenefactor ? 'G??nner bleiben' : 'G??nner werden',
          price: 100000,
        },
      ]
    : activeMembership
    ? []
    : [
        {
          name: 'MONTHLY_ABO',
          title: 'Monats-Abo',
          price: 2200,
        },
        {
          name: 'ABO',
          title: 'Jahresmitgliedschaft',
          price: 24000,
        },
        {
          name: 'BENEFACTOR',
          title: 'G??nner-Mitgliedschaft',
          price: 100000,
        },
      ]

  const shareProps = {
    url: `${PUBLIC_BASE_URL}/maerzkampagne`,
    tweet: '',
    emailBody: '',
    emailAttachUrl: true,
    emailSubject: '101 Gr??nde, die Republik jetzt zu unterst??tzen.',
    eventCategory: 'March2020',
  }

  return (
    <Frame
      raw
      pageColorSchemeKey='dark'
      meta={{
        url: `${PUBLIC_BASE_URL}/maerzkampagne`,
        pageTitle: 'Republik ??? das digitale Magazin von Project R',
        title: '101 Gr??nde, die Republik jetzt zu unterst??tzen.',
        description:
          'Unabh??ngiger Journalismus ohne Bullshit. Transparent. Werbefrei. Finanziert von den Leserinnen und Lesern.',
        image: `${CDN_FRONTEND_BASE_URL}/static/social-media/march20.jpg`,
      }}
      cover={<ReasonsVideo />}
    >
      <ContainerWithSidebar
        sidebarProps={{
          title: 'Jetzt unterst??tzen',
          crowdfunding: !actionsLoading &&
            crowdfunding && {
              ...crowdfunding,
              status: crowdfunding.status && {
                memberships: crowdfunding.status.memberships,
                people: crowdfunding.status.people,
                money: crowdfunding.status.money,
              },
            },
          links,
          packages,
          primaryQuery,
          statusProps: {
            memberships: true,
          },
        }}
        raw
      >
        <Box style={{ padding: 14, marginBottom: 20 }}>
          <Interaction.P>
            {t('crowdfunding2/beforeNote')}{' '}
            <Link href='/cockpit' passHref>
              <A>{t('crowdfunding2/beforeNote/link')}</A>
            </Link>
          </Interaction.P>
        </Box>
        <Lead>
          Unabh??ngiger Journalismus ohne Bullshit: Willkommen bei der Republik.
        </Lead>

        <P>
          Damit Sie uns vertrauen k??nnen, machen wir ein paar Dinge anders. Zum
          Beispiel sind wir komplett werbefrei. Und kompromisslos in der
          Qualit??t.
        </P>
        <P>
          Unser Ziel: Journalismus, der die K??pfe klarer, das Handeln mutiger,
          die Entscheidungen kl??ger macht. Und der das Gemeinsame st??rkt: die
          Freiheit, den Rechtsstaat, die Demokratie.
        </P>

        <P>{pledgeLink}</P>
        <div style={{ margin: '15px 0 0' }}>
          <Label style={{ display: 'block', marginBottom: 5 }}>
            Teilen Sie diese Seite mit Ihren Freunden:
          </Label>
          <ShareButtons {...shareProps} />
        </div>

        <Loader
          loading={data.loading}
          error={data.error}
          style={{ minHeight: 300 }}
          render={() => {
            if (!crowdfunding) {
              return null
            }
            const firstGoal = crowdfunding.goals[0]
            const { status, goals } = crowdfunding

            if (!firstGoal) {
              return null
            }

            const remainingPeople = firstGoal.people - status.people
            const remainingMoney = (firstGoal.money - status.money) / 100

            const initialGoalsReached =
              remainingMoney <= 0 && remainingPeople <= 0

            return (
              <div {...styles.stretchLead}>
                <Interaction.P {...styles.stretchP}>
                  {initialGoalsReached && (
                    <>
                      Wir sind dankbar und erfreut! Wir haben unsere
                      ??berlebenswichtigen Ziele schon Mitte M??rz gemeinsam mit
                      Ihnen erreicht. Die Republik hat definitiv eine Zukunft.
                      Herzlichen Dank!
                    </>
                  )}
                  {remainingMoney > 0 && remainingPeople > 0 && (
                    <>
                      Damit die Republik in Zukunft bestehen kann, brauchen wir
                      bis am 31.&nbsp;M??rz noch{' '}
                      <span {...styles.tnum}>
                        {countFormat(remainingPeople)}
                      </span>
                      &nbsp;Mitglieder und Abonnenten und{' '}
                      <span {...styles.tnum}>
                        {countFormat(remainingMoney)}
                      </span>{' '}
                      Franken. Um die Ziele zu erreichen, wollen wir diesen
                      Monat um{' '}
                      <Highlight>3000 Mitgliedschaften und Abos</Highlight>{' '}
                      wachsen. Denn eine m??glichst grosse Verlegerschaft sichert
                      die Republik langfristig am besten.
                    </>
                  )}
                  {remainingMoney > 0 && remainingPeople <= 0 && (
                    <>
                      Damit die Republik in Zukunft bestehen kann, brauchen wir
                      bis am 31.&nbsp;M??rz noch{' '}
                      <span {...styles.tnum}>
                        {countFormat(remainingMoney)}
                      </span>
                      &nbsp;Franken. Um das Ziel zu erreichen, wollen wir diesen
                      Monat um 3000 Mitgliedschaften und Abos wachsen. Denn eine
                      m??glichst grosse Verlegerschaft sichert die Republik
                      langfristig am besten.
                    </>
                  )}
                </Interaction.P>
                {goals.length === 1 && initialGoalsReached && (
                  <>
                    <Interaction.P
                      {...styles.stretchP}
                      style={{ marginTop: 10 }}
                    >
                      Die Republik will das Mediensystem mit einem neuen Modell
                      f??r unabh??ngigen Journalismus entscheidend ver??ndern ???
                      deshalb sammeln wir weiter. Und bleiben bei unserer
                      Ambition, diesen Monat 3000 Mitgliedschaften und Abos zu
                      verkaufen. Denn eine m??glichst grosse Verlegerschaft
                      sichert die Republik langfristig am besten.
                    </Interaction.P>
                  </>
                )}
                {goals.length > 1 && initialGoalsReached && (
                  <>
                    <Interaction.P
                      {...styles.stretchP}
                      style={{ marginTop: 10 }}
                    >
                      Die Republik will das Mediensystem mit einem neuen Modell
                      f??r unabh??ngigen Journalismus entscheidend ver??ndern ???
                      deshalb sammeln wir weiter.
                    </Interaction.P>
                    <List>
                      {goals
                        .filter((g) => g.description)
                        .map((goal, i) => (
                          <List.Item key={i}>{goal.description}</List.Item>
                        ))}
                    </List>
                    <Interaction.P
                      {...styles.stretchP}
                      style={{ marginTop: 10 }}
                    >
                      Danke f??rs Weitersagen!
                    </Interaction.P>
                  </>
                )}
              </div>
            )
          }}
        />

        <H2>Was ist die Republik?</H2>
        <P>
          Die Republik ist eine Dienstleistung f??r interessierte Menschen in
          einer grossen, faszinierenden und komplexen Welt.
        </P>
        <P>
          Wir recherchieren, fragen nach, ordnen ein und decken auf. Und liefern
          Ihnen Fakten und Zusammenh??nge als Grundlage f??r Ihre eigenen
          ??berlegungen und Entscheidungen.
        </P>
        <P>
          Das ist eine heikle Aufgabe. Denn Journalismus ist alles andere als
          harmlos: Es ist entscheidend, welche Geschichten erz??hlt werden.
        </P>
        <P>
          Weil Vertrauen im Journalismus die h??rteste W??hrung ist, haben wir die
          Republik so aufgestellt, dass wir diese Aufgabe f??r Sie bestm??glich
          erledigen k??nnen:
        </P>
        <P>
          <strong style={{ ...fontStyles.serifBold }}>
            Wir sind unabh??ngig.
          </strong>{' '}
          Und komplett werbefrei. So k??nnen wir uns auf unseren einzigen Kunden
          konzentrieren: Sie. Und m??ssen weder m??glichst viele Klicks generieren
          noch Sie mit nervigen Anzeigen bel??stigen. Und wir verkaufen Ihre
          pers??nlichen Daten niemals weiter.
        </P>
        <P>
          <strong style={{ ...fontStyles.serifBold }}>
            Wir sind das transparenteste Medienunternehmen (das wir kennen).
          </strong>
          Wir legen alles offen: unsere Finanzen, Besitzverh??ltnisse,
          Arbeitsweisen, Fehler, L??hne ??? weil wir ??berzeugt sind, dass es
          wichtig ist zu zeigen, unter welchen Bedingungen Journalismus
          hergestellt wird.
        </P>

        <P>
          <strong style={{ ...fontStyles.serifBold }}>
            Wir geh??ren niemandem ??? aber Ihnen ein bisschen.
          </strong>{' '}
          Mit einer Mitgliedschaft werden Sie auch Genossenschafter und damit
          der Republik. Das ist f??r Sie ohne Risiko, daf??r mit Einblick und
          Einfluss verbunden: Wir erkl??ren, was wir tun ??? und Sie k??nnen
          mitentscheiden.
        </P>

        <P>
          <strong style={{ ...fontStyles.serifBold }}>
            Wir sind kompromisslos in der Qualit??t.
          </strong>{' '}
          Unsere Reporter und Journalistinnen haben Zeit, um ein Thema mit der
          angebrachten Sorgfalt und Hartn??ckigkeit zu recherchieren. Und es gibt
          drei Dinge, an denen uns besonders viel liegt: Gute Sprache. Gute
          Bilder. Und gutes Design.
        </P>
        <P>
          <strong style={{ ...fontStyles.serifBold }}>
            Wir stehen mit Ihnen im Dialog.
          </strong>{' '}
          Und lieben es! Das Internet erm??glicht nicht nur viele neue Formen,
          wie wir Geschichten erz??hlen k??nnen, sondern auch den direkten Dialog
          mit Ihnen. Damit die Republik mit Ihrer Stimme vielf??ltiger,
          interessanter und reflektierter wird.
        </P>
        <P>{!activeMembership ? pledgeLink : ''}</P>
        <H2>Worum geht es?</H2>
        <P>
          Die Republik ist 2018 gestartet. Als Rebellion f??r den Journalismus.
          Und gegen den Einheitsbrei und die Vermischung von Journalismus und
          Werbung bei grossen Medienkonzernen.
        </P>

        <P>
          Wir haben nur einen einzigen Kunden: Sie. Als Leserinnen. Als B??rger.
          Als Menschen, die bereit sind, etwas Geld in unabh??ngigen Journalismus
          zu investieren.
        </P>

        <P>
          Um ein tragf??higes Modell f??r unabh??ngigen, werbefreien und
          leserfinanzierten Journalismus zu entwickeln, braucht die Republik
          rund 24???000 Mitglieder. Dieses Ziel wollen wir in den n??chsten Jahren
          gemeinsam mit m??glichst vielen von Ihnen erreichen.
        </P>
        <P>
          Wir sind ??berzeugt, das zu schaffen. Weil wir schon weit gekommen
          sind:
        </P>
        <Editorial.OL>
          <Editorial.LI>
            Wir liefern guten Journalismus. Die meisten Abonnenten bleiben der
            Republik treu, und viele haben ihre Mitgliedschaft jetzt schon zum
            zweiten Mal erneuert.
          </Editorial.LI>

          <Editorial.LI>
            Wir haben ??ffentliche Wirkung: Mit investigativen Recherchen ??? zum
            Beispiel zum B??ndner Baukartell oder zu Missst??nden bei der gr??ssten
            Kita-Kette der Schweiz ??? l??st die Republik nicht nur Debatten aus,
            sondern auch konkrete politische Reaktionen.
          </Editorial.LI>

          <Editorial.LI>
            Wir sind von einer starken Community getragen. Von unseren
            Leserinnen lernen wir jeden Tag, wie wir besser werden k??nnen. Und
            ??ber 1000 Freunde und Komplizen helfen mit, unseren Journalismus in
            jeden Winkel der Schweiz zu bringen.
          </Editorial.LI>
        </Editorial.OL>
        <P>
          Damit die Republik in Zukunft bestehen kann, brauchen wir einen
          Wachstumsschub. Deshalb haben wir uns ??berlebenswichtige Ziele
          gesetzt: Bis Ende M??rz mindestens 19???000 Mitglieder zu haben und 2,2
          Millionen Franken zu finden.
        </P>

        <P>Erreichen wir die Ziele nicht, beenden wir das Projekt.</P>

        <P>
          Den gr??sseren Teil des Geldes haben wir durch die Grossz??gigkeit
          unserer Mitglieder und Investorinnen bereits gefunden. Jetzt geht es
          darum, m??glichst viele neue Leute von der Republik zu begeistern.
        </P>

        <P>
          Wenn Sie mitmachen und wir es nicht schaffen, bekommen Sie Ihr Geld
          zur??ck. Wenn wir es schaffen, bekommen Sie nicht nur vern??nftigen
          Journalismus, sondern haben auch einen entscheidenden Beitrag zur
          Medienvielfalt in der Schweiz geleistet.
        </P>

        <P>{!activeMembership ? pledgeLink : ''}</P>
      </ContainerWithSidebar>
      <div {...styles.overviewOverflow}>
        <div {...styles.overviewContainer}>
          <Container
            style={{
              maxWidth: 1200,
              padding: 0,
            }}
          >
            <div style={{ padding: `0 ${TEASER_BLOCK_GAP}px` }}>
              <Loader
                loading={data.loading}
                error={data.error}
                style={{ minHeight: 420 }}
                render={() => (
                  <TeaserBlock
                    teasers={getTeasersFromDocument(data.front)}
                    highlight={highlight}
                    onHighlight={onHighlight}
                    maxHeight={500}
                    maxColumns={8}
                    lazy
                  />
                )}
              />
            </div>
            <div {...styles.overviewBottomShadow} />
          </Container>
        </div>
      </div>
      <Container>
        <Content>
          <H2>Was bekomme ich f??r mein Geld?</H2>

          <P>
            Sie erhalten t??glich eine bis drei neue Geschichten. Als Newsletter,
            im Web oder in der App. Das Konzept ist einfach: Einordnung und
            Vertiefung statt einer Flut von Nachrichten.
          </P>

          <P>
            Sie lesen und h??ren in der Republik zu allem, was aktuell,
            verworren, komplex ??? und f??r viele gerade wichtig ist. Derzeit
            besch??ftigen uns Klima, Digitalisierung, Kinderbetreuung und
            besonders intensiv die Folgen des Aufstiegs autorit??rer Politik f??r
            die Demokratie.
          </P>

          <P>
            Wir liefern Ihnen Recherchen, Analysen, Reportagen und
            Erkl??rartikel. Aufgemacht als digitales Magazin, mit ausgew??hlten
            Bildern, Illustrationen, Grafiken. Manchmal interaktiv. Manchmal als
            Podcast. Oder auch als Veranstaltung.
          </P>

          <P>
            Statt t??glichen News fassen wir einmal pro Woche in Briefings das
            Wichtigste aus der Schweiz und der Welt zusammen, kompakt und
            ??bersichtlich ??? damit Sie nichts verpassen.
          </P>

          <P>
            Die Republik bietet ein vielf??ltiges Programm an Themen, Autorinnen
            und Formaten. Und Sie entscheiden selbst, wie Sie die Republik
            nutzen m??chten: t??glich, w??chentlich oder unregelm??ssig; alles oder
            nur ausgew??hlte Beitr??ge, aktiv im Dialog mit anderen oder einfach
            ganz f??r sich allein einen Podcast geniessen.
          </P>

          <P>
            Sie k??nnen Beitr??ge, die Sie besonders freuen oder ??rgern, jederzeit
            mit Ihren Freunden teilen, selbst wenn diese kein Abo haben. Alle
            Beitr??ge der Republik sind frei teilbar, damit unser Journalismus
            m??glichst viele Menschen erreicht.
          </P>

          <P>
            Und einen entscheidenden Unterschied machen kann. Die Republik ist
            politisch nicht festgelegt, aber keineswegs neutral: Sie steht gegen
            die Diktatur der Angst. Und f??r die Werte der Aufkl??rung: f??r
            Klarheit im Stil, Treue zu Fakten, f??r L??sungen von Fall zu Fall,
            f??r Offenheit gegen??ber Kritik, Respektlosigkeit vor der Macht und
            Respekt vor dem Menschen.
          </P>

          <P>{!activeMembership ? pledgeLink : ''}</P>

          <H2>Wer macht die Republik?</H2>

          <P>
            Unsere Crew besteht aus kompetenten Profis. Den besten, die wir
            finden konnten. Sehen Sie selbst und bl??ttern Sie durch unsere
            Redaktion.
          </P>
        </Content>
      </Container>

      <div {...styles.cards}>
        <Loader
          loading={data.loading}
          error={data.error}
          style={{ minHeight: 420 }}
          render={() =>
            data.employees ? (
              <Employees
                employees={data.employees}
                filter={(e) => e.group === 'Redaktion'}
              />
            ) : null
          }
        />
      </div>

      {/* with loader data.employees */}

      <Container>
        <Content>
          <H2>Warum das alles wichtig ist</H2>

          <P>
            Bei der Republik und beim Journalismus ??berhaupt geht es nicht nur
            um den individuellen Nutzen. Es geht auch darum, eine wichtige
            Funktion in einer Demokratie auszu??ben: den M??chtigen auf die Finger
            zu schauen, unabh??ngig zu recherchieren und Missst??nde aufzudecken.
          </P>

          <P>
            Traditionelle Medien haben das Problem, dass mit dem Internet ihr
            Gesch??ftsmodell zusammengebrochen ist. Sie haben ihre
            Monopolstellung verloren, fast alles ist gratis im Netz verf??gbar.
            Die Bereitschaft, f??r Journalismus zu bezahlen, ist gesunken.
            Parallel dazu wanderten die Werbeeinnahmen fast vollst??ndig zu
            Google, Facebook und Co. ab.
          </P>

          <P>
            Die Folgen davon sind un??bersehbar: ein massiver Abbau bei
            Redaktionen auf Kosten der Qualit??t und Vielfalt. Seit 2011 sind in
            der Schweiz unter dem Strich mehr als 3000 Stellen im Journalismus
            verschwunden. (Das ist viel: damit k??nnte man 100 Republiken machen.
          </P>

          <P>
            Zeitungen fusionieren, Redaktionen werden zusammengelegt, es gibt
            immer weniger Vielfalt im Schweizer Medienmarkt. In der
            Deutschschweiz verf??gen Tamedia, Ringier und die NZZ mit ihren
            Zeitungen bereits ??ber 80% Marktanteil.
          </P>

          <P>
            Und als neueste Entwicklung, um den sinkenden Werbeeinnahmen
            entgegenzuwirken, gehen die Verlage immer dreistere Deals mit
            Werbekunden ein. Die Grenze zwischen redaktionellen Beitr??gen und
            Werbung verwischt. Der Presserat kritisiert in einem Leiturteil
            diese Grenz??berschreitungen der Verlage. Damit werde das Publikum
            get??uscht und irregef??hrt. Die Medien schaden so ihrer eigenen
            Glaubw??rdigkeit als unabh??ngige Berichterstatter.
          </P>

          <P>
            Kurz: Es steht nicht unbedingt gut um die Medienbranche und die
            Zukunft des Journalismus.
          </P>

          <P>
            Als Antwort auf diese Entwicklungen ??? und aus Leidenschaft f??r guten
            Journalismus ??? bauen wir die Republik auf.
          </P>

          <P>
            Einerseits als konkreten Beitrag zur Vielfalt. Mit einem Medium, das
            Unabh??ngigkeit konsequent ernst nimmt. Andererseits auch als Labor
            f??r den Journalismus des 21. Jahrhunderts. Daf??r ist es notwendig,
            ein funktionierendes Gesch??ftsmodell zu entwickeln.
          </P>

          <P>
            Eine Republik baut niemand alleine, sondern nur viele gemeinsam. Wir
            mit Ihnen?
          </P>
          <br />
          {inNativeIOSApp ? (
            <Interaction.P
              style={{ color: colors.error, marginBottom: 15, marginTop: 15 }}
            >
              {t('cockpit/ios')}
            </Interaction.P>
          ) : (
            primaryQuery && (
              <Link
                href={{ pathname: '/angebote', query: primaryQuery }}
                passHref
              >
                <Button primary style={{ minWidth: 300 }}>
                  {activeMembership && !shouldBuyProlong
                    ? 'Wachstum schenken'
                    : 'Jetzt mitmachen!'}
                </Button>
              </Link>
            )
          )}

          <div style={{ margin: '15px 0 40px' }}>
            <Label style={{ display: 'block', marginBottom: 5 }}>
              Jetzt andere auf die Republik aufmerksam machen:
            </Label>
            <ShareButtons {...shareProps} />
          </div>

          <H2>
            {countFormat(
              (crowdfunding && crowdfunding.status.people) || 'Unsere',
            )}{' '}
            Verlegerinnen und Verleger
          </H2>
          {crowdfunding && (
            <div style={{ margin: '20px 0' }}>
              <LazyLoad>
                <TestimonialList
                  first={10}
                  ssr={false}
                  membershipAfter={crowdfunding.endDate}
                  share={false}
                />
              </LazyLoad>
            </div>
          )}

          <Link href='/community' passHref>
            <A>Alle ansehen</A>
          </Link>

          <br />
          <br />
          <br />
        </Content>
      </Container>
    </Frame>
  )
}

const EnhancedPage = compose(
  withSurviveStatus,
  withMe,
  withRouter,
  graphql(query, {
    props: (args) => {
      return {
        ...mapActionData(args),
        data: args.data,
      }
    },
    options: ({ router: { query } }) => ({
      variables: {
        accessToken: query.token,
      },
    }),
  }),
  withInNativeApp,
  withT,
)(Page)

export default withDefaultSSR(EnhancedPage)
