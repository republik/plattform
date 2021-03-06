import Router, { withRouter } from 'next/router'
import { css } from 'glamor'

import { thousandSeparator } from '../lib/utils/format'
import withT from '../lib/withT'
import withInNativeApp from '../lib/withInNativeApp'

import Frame from '../components/Frame'
import Box from '../components/Frame/Box'
import VideoCover from '../components/VideoCover'
import ActionBar from '../components/ActionBar'
import List, { Highlight } from '../components/List'
import { ListWithQuery as TestimonialList } from '../components/Testimonial/List'
import ContainerWithSidebar from '../components/Crowdfunding/ContainerWithSidebar'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

import {
  Label,
  Button,
  Lead,
  P,
  A,
  H1,
  H2,
  Interaction,
  VideoPlayer,
  useColorContext,
  fontStyles,
  Editorial,
} from '@project-r/styleguide'
import Link from 'next/link'
import { withDefaultSSR } from '../lib/apollo/helpers'

const styles = {
  mediaDiversity: css({
    margin: '20px 0',
    '& img': {
      width: 'calc(50% - 10px)',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'inherit',
      margin: 5,
    },
  }),
  stretchLead: css({
    margin: '20px 0 0',
  }),
  stretchP: css({
    fontSize: 17,
    lineHeight: '25px',
  }),
}

export const VIDEOS = {
  main: {
    hls: 'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
    mp4: 'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=175',
    subtitles: '/static/subtitles/main.vtt',
    thumbnail: `${CDN_FRONTEND_BASE_URL}/static/video/main.jpg`,
  },
  team: {
    hls: 'https://player.vimeo.com/external/213078685.m3u8?s=09907679a29279449533845fa451ef9a3754da02',
    mp4: 'https://player.vimeo.com/external/213078685.hd.mp4?s=150318d6e82f1f342442340bade748be38280e61&profile_id=175',
    subtitles: '/static/subtitles/team.vtt',
    thumbnail: `${CDN_FRONTEND_BASE_URL}/static/video/team.jpg`,
  },
}

export const Page = ({ router, t, inNativeIOSApp }) => {
  const [colorScheme] = useColorContext()
  const pledgeLink = inNativeIOSApp ? null : (
    <Link href='/angebote' passHref>
      <A>Jetzt mitmachen!</A>
    </Link>
  )

  const links = [
    {
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
      text: 'Sie wollen Investor/Investorin werden?',
    },
  ]
  const packages = [
    {
      name: 'ABO',
      title: 'F??r mich',
      price: 24000,
    },
    {
      name: 'ABO_GIVE',
      title: 'F??r andere',
      price: 24000,
    },
    {
      name: 'BENEFACTOR',
      title: 'F??r G??nner',
      price: 100000,
    },
    {
      name: 'DONATE',
      title: 'Spenden, sonst nichts',
    },
  ]

  const shareObject = {
    url: PUBLIC_BASE_URL + router.pathname,
    emailSubject: 'Es ist Zeit.',
  }

  return (
    <Frame
      raw
      meta={{
        url: `${PUBLIC_BASE_URL}/crowdfunding`,
        pageTitle: 'Republik ??? das digitale Magazin von Project R',
        title: 'Republik ??? das digitale Magazin von Project R',
        description: 'Das war unser Crowdfunding.',
        image: `${CDN_FRONTEND_BASE_URL}/static/social-media/main.jpg`,
      }}
      cover={<VideoCover src={VIDEOS.main} cursor endScroll={0.97} />}
    >
      <ContainerWithSidebar
        sidebarProps={{
          links,
          packages,
          crowdfundingName: 'REPUBLIK',
          title: 'Abo und Mitgliedschaft f??r ein Jahr',
        }}
      >
        <Box style={{ padding: 14, marginBottom: 20 }}>
          <Interaction.P>
            {t('crowdfunding/beforeNote')}{' '}
            <Link href='/cockpit' passHref>
              <A>{t('crowdfunding/beforeNote/link')}</A>
            </Link>
          </Interaction.P>
        </Box>

        <Lead>
          Willkommen zum Crowdfunding f??r das digitale Magazin Republik von
          Project&nbsp;R
        </Lead>

        <P>
          Die Republik ist eine kleine Rebellion. F??r den Journalismus. Und
          gegen die Medienkonzerne. Denn die grossen Verlage verlassen die
          Publizistik: Sie bauen sich in hohem Tempo in Internet-Handelsh??user
          um. Das ist eine schlechte Nachricht f??r den Journalismus. Aber auch
          f??r die Demokratie. Denn ohne vern??nftige Informationen f??llt man
          schlechte Entscheidungen.
        </P>
        <P>
          Eine funktionierende Demokratie braucht funktionierende Medien. Und
          daf??r braucht es nicht nur Journalistinnen und Journalisten, sondern
          auch Sie. Als Leserinnen. Als B??rger. Als Menschen, die bereit sind,
          etwas Geld in unabh??ngigen Journalismus zu investieren.
        </P>
        <P>{pledgeLink}</P>

        <div style={{ margin: '15px 0 0' }}>
          <Label style={{ display: 'block', marginBottom: 5 }}>
            Teilen Sie diese Seite mit Ihren Freunden:
          </Label>
          <ActionBar share={shareObject} />
        </div>

        <div {...styles.stretchLead}>
          <Interaction.P {...styles.stretchP} style={{ marginBottom: 10 }}>
            Damit das digitale Magazin Republik an den Start gehen kann, haben
            wir 3000 Abonnentinnen und Abonnenten sowie 750{thousandSeparator}
            000 Franken gesucht. Dieses Ziel haben wir zusammen mit Ihnen am
            ersten Tag des Crowdfundings nach sieben Stunden und 49 Minuten
            erreicht. Herzlichen Dank!
          </Interaction.P>
          <Interaction.P {...styles.stretchP}>
            Republik will das Mediensystem entscheidend ver??ndern ??? deshalb
            sammeln wir weiter!
          </Interaction.P>
          <List>
            <List.Item>
              <Highlight>Bei 5000</Highlight> Unterst??tzerinnen und
              Unterst??tzern haben wir zwei weitere Ausbildungspl??tze f??r junge
              Journalistinnen und Journalisten geschaffen.
            </List.Item>
            <List.Item>
              <Highlight>Bei 7000</Highlight> Mitgliedern haben wir die
              Redaktion um einen zus??tzlichen Kopf vergr??ssert.
            </List.Item>
            <List.Item>
              <Highlight>Bei 9000</Highlight> Unterst??tzerinnen und
              Unterst??tzern realisieren wir pro Jahr zus??tzlich vier grosse und
              aufw??ndige Recherchen. Gemeinsam mit Ihnen haben wir das
              geschafft. Danke!
            </List.Item>
            <List.Item>
              <Highlight>Bei 10{thousandSeparator}000</Highlight> Abonnenten und
              Verlegerinnen haben wir ein fixes Budget eingerichtet, um
              herausragende internationale Autorinnen und Autoren f??r die
              Republik zu gewinnen. Danke allen, die mitmachen!
            </List.Item>
            <List.Item>
              <Highlight>Bei 12{thousandSeparator}000</Highlight> Abonnentinnen
              haben wir eine echte Neuheit in der Geschichte des Crowdfundings
              versprochen: nichts Neues! Also das, was wir Ihnen seit dem Start
              dieses Crowdfundings versprechen: Journalismus ??? kompromisslos in
              der Qualit??t, leserfinanziert, ohne Werbung. Danke f??r Ihre
              Unterst??tzung!
            </List.Item>

            <List.Item>
              Es ist ??berw??ltigend, was wir gemeinsam mit Ihnen in den letzten 5
              Wochen erreicht haben: tats??chlich einen Unterschied zu machen!
              Genau daf??r wird das digitale Magazin Republik von Project R
              entwickelt, daran arbeiten wir. Das Crowdfunding l??uft noch bis am
              Mittwoch, 31. Mai um 20 Uhr. Das Ziel bei Erreichung von 14
              {thousandSeparator}000 Abonnentinnen haben unsere Verlegerinnen
              und Verleger in einer{' '}
              <A href='https://web.archive.org/web/20170708151956/https://www.republik.ch/vote'>
                Abstimmung
              </A>{' '}
              bestimmt: den Ausbau des Datenjournalismus-Teams. Gemeinsam
              schaffen wir das! Danke f??rs Mitmachen und Weitersagen!
            </List.Item>
          </List>
        </div>

        <br />
        <H1>Worum es geht</H1>
        <P>
          Es ist Zeit, selbst Verantwortung zu ??bernehmen. Unsere Aufgabe dabei
          ist, eine zeitgem??sse Form f??r den Journalismus zu entwickeln. Die
          Republik wird ein schlankes, schlagkr??ftiges Magazin im Netz. Mit dem
          Ziel, bei den grossen Themen, Fragen und Debatten Klarheit und
          ??berblick zu bieten. Und das aufrichtig, ohne Schn??rkel, mit grossem
          Herzen. Unser Ziel dabei ist, gemeinsam mit Ihnen ein neues Modell im
          Medienmarkt zu etablieren: kompromisslos in der Qualit??t, ohne
          Werbung, finanziert von den Leserinnen und Lesern. Es ist Zeit f??r
          Journalismus ohne Bullshit.
        </P>
        <P>
          Bis jetzt haben Investorinnen und Spender rund 3,5 Millionen Franken
          zugesagt. Die Zahlung der Gelder ist aber an eine Bedingung gekn??pft:
          den Test, ob das Publikum das neue Magazin auch will. Dazu dient
          dieses Crowdfunding. Wir brauchen mindestens 3000 zuk??nftige
          Leserinnen und Leser, die bereit sind, Republik zu abonnieren. Und wir
          m??ssen mindestens 750&nbsp;000 Franken zusammenbekommen.
        </P>
        <P>
          Schaffen wir beide Ziele, zahlen die Investoren. Und die Entwicklung
          der Republik ist f??r fast zwei Jahre gesichert. Scheitern wir, fliesst
          kein Franken. Wir schliessen unser Unternehmen. Und Sie erhalten Ihren
          Beitrag zur??ck.
        </P>
        <P>
          Entscheiden Sie sich, mitzumachen, werden Sie Abonnentin. Sie erhalten
          ab Anfang 2018 ein Jahr lang die Republik. Plus verg??nstigten Zugang
          zu allen Veranstaltungen. Ausserdem werden Sie automatisch ein Teil
          des Unternehmens ??? als Mitglied der Project R Genossenschaft. Kurz,
          Sie werden ein klein wenig Verleger der Republik. Und haben dadurch
          auch die Privilegien einer Verlegerin: etwa den Einblick in alle
          wichtigen Entscheide der Redaktion. Damit machen Sie ??brigens kein
          schlechtes Gesch??ft: Denn f??r jedes Abonnement, in das Sie f??r den
          Start der Republik investieren, riskieren die grossen Investorinnen
          und Investoren 1118.40 Franken zus??tzlich.
        </P>
        <P>
          Ihr Risiko betr??gt dabei 240 Franken pro Jahr. Also der Preis, den man
          pro Jahr w??chentlich f??r einen Kaffee im Restaurant ausgibt.
        </P>
        <P>
          Mit diesem Betrag k??nnen Sie einen echten Unterschied machen. Denn es
          ist Zeit, dem Journalismus ein neues Fundament zu bauen. Und das
          schafft niemand allein. Sondern nur viele gemeinsam: wir mit Ihnen.
          Willkommen an Bord!
        </P>
        <P>{pledgeLink}</P>
        <H1> Wer wir sind</H1>
        <P>
          Ihre Partnerin bei diesem Projekt ist die Aufbaucrew der Republik und
          von Project R. Wir sind seit drei Jahren an der Arbeit, zuerst lange
          in Nachtarbeit, seit Januar 2017 hauptberuflich. Mittlerweile besteht
          die Crew aus fast einem Dutzend Journalisten, Start-up-,
          Kommunikations-, Organisations- und IT-Spezialistinnen. (Und einigen
          Dutzend Komplizen und Beraterinnen im Hintergrund.)
        </P>

        <P>
          Die Kurzportr??ts der Crew finden Sie{' '}
          <Link href='/impressum' passHref>
            <A>hier</A>
          </Link>
          . Und dazu im Video die Lesung unseres{' '}
          <A href='/manifest' target='_blank'>
            Manifests
          </A>{' '}
          zur Gr??ndung der Republik:
        </P>

        <div style={{ marginBottom: 40, marginTop: 10 }}>
          <VideoPlayer src={VIDEOS.team} />
        </div>

        <H1>Warum wir es&nbsp;tun</H1>
        <P>
          Das Problem der traditionellen Medien ist, dass ihr Gesch??ftsmodell
          zusammengebrochen ist. ??ber ein Jahrhundert lang waren Zeitungsverlage
          praktisch Gelddruckmaschinen mit enormer Rendite: Man verkaufte
          Nachrichten an die Leserinnen und Leser ??? und die Leserinnen und Leser
          an die Werbung.
        </P>
        <P>
          Doch das ist Geschichte. Denn die Inserate sind ins Netz verschwunden.
          Und die grossen Verlage folgen dem Gesch??ft. Die Gewinne machen heute
          die Suchmaschinen: f??r Jobs, Autos, Immobilien, Liebe. Nur brauchen
          Suchmaschinen keine Leitartikel mehr auf der R??ckseite. Verlage wie
          Tamedia, Ringier ??? oder in Deutschland Springer ??? verlassen deshalb
          die Publizistik. Ihr Geld, ihre Ideen, ihre Planung investieren sie in
          das neue Gesch??ft. Redet man mit Leuten der Chefetage, ist es l??ngst
          keine Frage mehr, ob Journalismus noch zum Gesch??ft von morgen geh??rt.
          Er tut es nicht. Ihre Zukunft sehen die Medienkonzerne als Schweizer
          Amazon.
        </P>
        <P>
          Bis es so weit ist, wird die sterbende Cashcow noch so lange wie
          m??glich gemolken. Investitionen fliessen kaum mehr in den
          Journalismus; bei eigenen Medien wird nur noch gespart. Dazu wird
          fusioniert, was geht. Kleinere Zeitungen werden zwecks Reichweite
          eingekauft. Und verdaut. Bereits heute beherrschen Tamedia, NZZ und
          Ringier zusammen 80 Prozent der ver??ffentlichten Meinung.
        </P>

        <div
          {...styles.mediaDiversity}
          {...colorScheme.set('borderColor', 'divider')}
        >
          <img
            alt='??Amokfahrer rast in Menschen in London?? bazonline.ch am 22. M??rz 2017 um 16 Uhr'
            src={`${CDN_FRONTEND_BASE_URL}/static/crowdfunding1/baz.png`}
          />
          <img
            alt='??Amokfahrer rast in Menschen in London?? tagesanzeiger.ch am 22. M??rz 2017 um 16 Uhr'
            src={`${CDN_FRONTEND_BASE_URL}/static/crowdfunding1/ta.png`}
          />
          <img
            alt='??Amokfahrer rast in Menschen in London?? derbund.ch am 22. M??rz 2017 um 16 Uhr'
            src={`${CDN_FRONTEND_BASE_URL}/static/crowdfunding1/bund.png`}
          />
          <img
            alt='??Amokfahrer rast in Menschen in London?? bernerzeitung.ch am 22. M??rz 2017 um 16 Uhr'
            src={`${CDN_FRONTEND_BASE_URL}/static/crowdfunding1/bz.png`}
          />
        </div>

        <P>
          Auch ohne weitere Deals verflacht der Journalismus. Denn in der Krise
          fusionieren die grossen Verlage ihre Medien zu riesigen Klumpen. Beim
          ??Tages-Anzeiger?? etwa werden die schnellen News mit ??20 Minuten??
          gemacht, die Bundeshaus-Berichterstattung kommt vom ??Bund??, Ausland,
          Wirtschaft und Kultur liefert zu immer gr??sseren Teilen die
          ??S??ddeutsche Zeitung??, zu kleinen Teilen die ??Basler Zeitung??, die
          hinteren B??nde sind mit der ??SonntagsZeitung?? zusammengelegt worden.
          Und gedruckt wird mit der NZZ.
        </P>
        <P>
          Kurz: Es ist das Organigramm von Frankensteins Monster. Zwar hat die
          Zeitung noch hervorragende Journalisten und Artikel, als Zeitung ist
          sie aber so gut wie unsteuerbar. Und sie ist keineswegs allein.
          Ringier hat die gesamte ??Blick??-Gruppe zusammengeschmolzen, die NZZ
          ihre Regionalzeitungen. ??konomisch machen diese Fusionen zwar Sinn,
          f??r die ??ffentlichkeit aber sind sie ein Problem. Denn mit dem
          Zusammenschmelzen wird die Identit??t der Bl??tter vernichtet, ihre
          Kompetenz, ihre Tradition. Und in der politischen Debatte verf??llt die
          Meinungsvielfalt: Mit den Fusionen verarmt der Wettbewerb an
          Standpunkten, Ideen, Blickwinkeln.
        </P>
        <H2>Comeback der Parteipresse</H2>
        <P>
          Stattdessen erlebt die rechte Parteipresse ein Comeback. Im Fr??hling
          2002 ??bernahm eine Gruppe von Rechtsb??rgerlichen um Financier Tito
          Tettamanti die ??Weltwoche??. Acht Jahre sp??ter kauften fast exakt
          dieselben Leute die ??Basler Zeitung??. Nach langem Versteckspiel
          stellte sich SVP-Milliard??r Christoph Blocher als der wahre K??ufer
          heraus.
        </P>
        <P>
          In der Schweiz wiederholt sich damit die gleiche Geschichte wie in den
          USA: Mit sinkenden Einnahmen werden Medien zum Spielzeug f??r
          Milliard??re. Statt Umsatzrendite wollen sie Einfluss: eine politische
          Dividende. Das ist kein gutes Zeichen f??r die Demokratie. Denn die
          Ballung von Kapital, Medienmacht und Politik ist ein klassisches
          Merkmal der Oligarchie.
        </P>
        <P>
          In den USA f??hrten die Medien-Investments von Milliard??ren dazu, dass
          sich das Mediensystem radikal in zwei Lager spaltet. Und heute nicht
          mehr unterschiedliche Blickwinkel auf die Wirklichkeit vermittelt,
          sondern zwei komplett verschiedene Wirklichkeiten. Die Amerikaner
          leben in zwei Paralleluniversen, nicht nur mit verschiedenen
          Meinungen, sondern mit komplett verschiedenen Fakten. Kein Wunder,
          radikalisierte sich die Gesellschaft. Und Donald Trump kam in seinem
          Universum mit allen L??gen durch. Die Spaltung der Welt gebiert
          Monster.
        </P>
        <P>
          In der Schweiz k??nnte das System noch absurder ausfallen. Deshalb,
          weil nur noch ein einziger K??ufer von Medientiteln auf dem Markt ist:
          Christoph Blocher. Mit der Tamedia AG stand er zweimal kurz vor einem
          Gesch??ftsabschluss ??? zuerst mit dem Kauf der ??SonntagsZeitung??, sp??ter
          mit dem Tausch der ??Basler Zeitung?? gegen die Z??rcher Landzeitungen
          plus der ??Berner Zeitung??. Beide Deals scheiterten nur knapp an einem
          Veto im Tamedia-Verwaltungsrat.
        </P>
        <P>
          Auch die NZZ wird von ganz rechts bedr??ngt. 2014 kauften
          SVP-Strohm??nner massiv NZZ-Aktien. Der Druck wirkte. Der freisinnige
          NZZ-Verwaltungsrat w??hlte den Blocher-Biografen Markus Somm zum
          Chefredaktor. Erst nach massiven Protesten aus Redaktion und
          Leserschaft wurde Somm fallen gelassen. Aber nicht sein Kurs. Auch
          ohne ihn driftet die NZZ entschlossen nach rechts.
        </P>
        <P>
          Diesen Fr??hling haben SVP-Kreise ein Kaufangebot f??r die gesamte
          ??Blick??-Gruppe gemacht. Dazu droht Blocher den Verlegern mit der
          Lancierung einer Gratis-Sonntagszeitung. Und l??sst in Basel bereits
          eine Druckmaschine bauen.
        </P>
        <P>
          Kurz: Die fl??chendeckende ??bernahme der Schweizer Medien durch den
          Chef der gr??ssten Schweizer Partei ist kein unplausibles Szenario.
          Kein Wunder, schiesst die SVP mit allen Mitteln gegen die SRG. Sie
          w??re dann die letzte verbliebene Konkurrentin auf dem Meinungsmarkt.
        </P>
        <H2>Pervertierter Journalismus</H2>
        <P>
          Doch selbst wenn sich nichts ??ndert, ist das Schweizer Mediensystem
          alles andere als in Form, um seinen Job als Wachhund der Demokratie
          wahrzunehmen. Denn die zwei politisch folgenreichsten Innovationen der
          Schweizer Medien im vergangenen Jahrzehnt sind alles andere als
          f??rderlich f??r die ??ffentlichkeit.
        </P>
        <P>
          <strong style={{ ...fontStyles.serifBold }}>
            Innovation Nummer 1: Die Doppelzange
          </strong>
          . Eine Person, die Differenzen mit Christoph Blocher hat, ger??t
          doppelt ins Schussfeld. Sie bekommt nicht nur ??rger mit der gr??ssten
          Sondern wird auch in der ??Weltwoche?? und der ??Basler Zeitung??
          angegriffen. Die Doppelzange ist ein ebenso neues wie wirksames
          Disziplinierungsinstrument in der Schweizer Politik ??? nicht zuletzt
          f??r unabh??ngige K??pfe im b??rgerlichen Lager. Und sogar in der SVP
          selbst.
        </P>
        <P>
          <strong style={{ ...fontStyles.serifBold }}>
            Innovation Nummer 2: Die kleine Emp??rungsgeschichte
          </strong>
          . Sie entsteht aus der Logik des Internet-Journalismus. Eine ideale
          Geschichte f??r schnelle Onlineportale muss folgende Merkmale haben:
          Sie muss schnell produzierbar sein, dazu leicht verst??ndlich,
          m??glichst viele Reaktionen ausl??sen und fortsetzbar sein. Die kleine
          Emp??rungsgeschichte erf??llt diese Vorgaben nahezu ideal: Eine
          SP-Nationalr??tin raucht im Rauchverbot, ein SVP-Nationalrat
          besch??ftigt eine Asylbewerberin als Putzkraft, ein jugendlicher
          Gewaltt??ter erh??lt eine teure Therapie. Kaum ist die Story erschienen,
          springt die Konkurrenz auf. Und dann rollt eine fl??chendeckende Walze:
          Emp??rte Leserkommentare, Expertenmeinungen, Verteidigungen der
          Angeschuldigten, R??cktrittsforderungen, Pressekonferenzen mit
          Live-Tickern, und am Ende mahnen die Medienwissenschaftler. Sollte
          irgendwann in der Zukunft eine Historikerin zu bestimmen versuchen,
          was das bedeutendste Ereignis in der Schweizer Politik der letzten
          Jahre war, k??me sie ??? rein quantitativ ??? zum Schluss, dass es mit
          mehreren Tausend Artikeln die Geschichte eines gr??nen Nationalrats
          gewesen sein musste, der einer Bekannten privat ein Bild seines Penis
          schickte.
        </P>
        <P>
          Das Resultat der kleinen Emp??rungsgeschichte ist mehr als nur
          Zeitverschwendung. Nach dem ??Fall Carlos?? etwa, dem Jugendlichen mit
          der teuren Therapie, mussten die Jugendarbeiter im Kanton Aargau aus
          Furcht vor Medienanfragen ihre Dossiers r??ckwirkend neu begr??nden. Und
          alle F??lle unartiger Jugendlicher gingen ab sofort ??ber den Tisch des
          Regierungsrats. Statt dass man sagte: ??Du dumme Siech hast Seich
          gemacht, jetzt gehst du zwei Wochen auf die Alp und denkst nach!?? ???
          wurde nun aus jeder Dummheit ein Verwaltungsakt.
        </P>
        <P>
          Der Job der Medien w??re, f??r freiere K??pfe und schlankere L??sungen zu
          sorgen. Die Doppelzange und die kleine Emp??rungsgeschichte bewirken
          das exakte Gegenteil. Ihr Produkt ist: mehr Angst. Und mehr
          B??rokratie.
        </P>
        <P>
          Kurz: Es ist Zeit f??r etwas Neues. Unsere Pl??ne f??r die Republik
          finden Sie gleich als N??chstes. Den Link zum Republik-Manifest von
          Project R <A href='/manifest'>hier</A>. Und den Link, um sofort
          mitzumachen, hier: {pledgeLink}
        </P>
        <br />
        <img
          alt='Das Manifest h??ngt am Balkon des Hotel Rothaus'
          src='/static/crowdfunding1/rothaus_manifest.jpg'
          style={{ width: '100%' }}
        />
        <H1>Was wir versprechen</H1>

        <P>
          Die Republik wird ein Magazin f??r die ??ffentliche Debatte ??? f??r
          Politik, Wirtschaft, Gesellschaft. Ihr Job ist alles, was unklar,
          l??rmig, verwickelt ist. Wir sehen uns als Service. W??hrend Sie ein
          vern??nftiges Leben f??hren ??? mit Familie, Job, Hobby ???, arbeiten wir
          uns durch den Staub der Welt. Und liefern Ihnen das Wesentliche. Mit
          Ihrem Abonnement finanzieren Sie sich quasi ein privates
          Expeditionsteam in die Wirklichkeit.
        </P>

        <P>
          Die Produkte unseres Magazins werden entweder sehr kurz oder lang
          sein: Sie bekommen das Konzentrat ??? oder die ganze Geschichte. Um das
          zu erreichen, werden wir anders arbeiten als die herk??mmlichen Medien:
        </P>
        <Editorial.OL>
          <Editorial.LI>
            Da wir als kleinere Crew gegen weit gr??ssere Redaktionen antreten,
            bleibt uns nichts als Konzentration: Wir d??rfen nichts machen als
            das Wichtige. Aber dieses m??ssen wir gross machen, gross in der
            Recherche, im Blick, in der Aufmachung ??? und grossz??gig in der
            Haltung: So, als h??tte die Schweiz Anschluss ans Meer.
          </Editorial.LI>
          <Editorial.LI>
            Da wir uns konzentrieren m??ssen, werden wir auf Halbes,
            Halbgedachtes, Halblanges, kurz: auf Bullshit verzichten. Wir werden
            Sie nicht mit Unfertigem bel??stigen.
          </Editorial.LI>
          <Editorial.LI>
            Unser Ziel ist ein komplett anderes als das der traditionellen
            Medien. Das Ziel einer traditionellen Zeitung ist die Abarbeitung
            der t??glichen Agenda, das Ziel eines traditionellen Onlineportals
            sind Reichweite und Klicks. Wir, als leserfinanziertes Medium, haben
            keine andere Wahl, als Sie zu ??berzeugen. Denn ohne ??berzeugung
            zahlen Sie nicht. Bei unseren Texten werden die Autoren leiden,
            nicht die Leserinnen.
          </Editorial.LI>
        </Editorial.OL>
        <H2>Die Redaktion</H2>

        <P>
          Die Redaktion, die das leisten muss, wird aus sehr verschiedenen
          Leuten bestehen. Wir wollen sie nach Alter, Herkunft, F??higkeiten
          m??glichst gemixt. Und fifty-fifty nach Geschlecht. Das erscheint uns
          das beste Gegengift gegen blinde Flecken. Wichtig sind uns im
          Unternehmen die enge Verzahnung von Journalismus, IT und Verlag. Und
          bei unseren Angestellten K??nnen, Leidenschaft, Mut. Denn wenn wir
          unseren Job schlecht machen, gibt es keine Ausrede. Unser einziges
          Produkt ist vern??nftiger Journalismus. Wir haben keine Ablenkung durch
          ein Tagesgesch??ft mit News. Und unser einziger Kunde sind Sie. Wir
          verzichten auf jedes Nebengesch??ft mit Werbung.
        </P>

        <P>
          Sobald Sie ein Abonnement kaufen, werden Sie ein klein wenig Besitzer
          oder Besitzerin des Unternehmens. Sie sind Mitglied der Project R
          Genossenschaft, die das gr??sste Aktienpaket an der Republik h??lt.
          Damit erhalten Sie Einladungen zu Veranstaltungen, Einblick in die
          Entscheidungen der Redaktion und freien Zugang zum Magazin. Und haben
          die M??glichkeit, jeden Artikel im Netz mit Freunden zu teilen.
        </P>
        <P>
          Die Artikel sind teilbar, weil wir Wirkung auf die politische Debatte
          wollen. Die Republik ist politisch nicht festgelegt, aber keineswegs
          neutral: Sie steht f??r die Verteidigung der Institutionen der
          Demokratie ??? wie etwa des Rechtsstaates ??? gegen den Vormarsch der
          Autorit??ren. Sie steht gegen die Diktatur der Angst. Und f??r die Werte
          der Aufkl??rung: f??r Klarheit im Stil, f??r Treue zu Fakten, f??r
          L??sungen von Fall zu Fall, f??r Offenheit gegen??ber Kritik, f??r
          Respektlosigkeit vor der Macht und Respekt vor dem Menschen, f??r die
          Freiheit des Einzelnen und aller seiner Gedanken.
        </P>
        <H2>Ein neues Modell</H2>
        <P>
          Es ist uns klar, dass unsere Aufgabe aus mehr als nur Worten besteht.
          Dass nicht nur einzelne Recherchen, Enth??llungen oder Essays z??hlen,
          sondern dass wir ein funktionierendes Unternehmen bauen m??ssen. Eines,
          das auf dem Markt besteht und mindestens selbsttragend wird. Denn es
          geht uns nicht nur um unsere Vorstellung von Journalismus, es geht uns
          nicht zuletzt um die Institution des Journalismus. Die Demokratie
          braucht freie Medien; die Medien brauchen ein neues Gesch??ftsmodell.
          Wir wissen um das Risiko. Und wir wissen um unsere Verantwortung. Und
          haben deshalb die Start-up-, Organisations- und Finanzprofis an Bord
          geholt, um vern??nftig zu wirtschaften.
        </P>
        <img
          src='/static/crowdfunding1/vernetzt.jpg'
          style={{ width: '100%' }}
        />
        <P>
          Last, not least ist die Republik ausbauf??hig. Wir w??nschen der
          Konkurrenz nur das Beste. Aber sollten die Zeitungen weiter ins Graue
          gespart oder an politische Akteure verkauft werden, k??nnen wir das
          Projekt ausbauen: in Richtung Feuilleton, in Richtung Lokalredaktionen
          oder Romandie. Oder wohin immer es n??tig ist. Wir sind unabh??ngig von
          Verlegern, B??rse und Werbung. Und wir werden das nutzen. Unsere
          Verpflichtung gilt niemandem ausser unseren Leserinnen und Lesern.
          Denn wir geh??ren keinem Verlag, machen keine Werbung. Wir geh??ren nur
          ??? ein wenig ??? Ihnen.
        </P>
        <P>
          So weit unser Versprechen. Jetzt ist es Zeit f??r Ihre Entscheidung.
        </P>
        <P>Willkommen an Bord!</P>
        <br />
        {!inNativeIOSApp && (
          <Link href='/angebote' key='pledge' passHref>
            <Button primary style={{ minWidth: 300 }}>
              Jetzt mitmachen!
            </Button>
          </Link>
        )}

        <div style={{ margin: '15px 0 40px' }}>
          <Label style={{ display: 'block', marginBottom: 5 }}>
            Jetzt andere auf die Republik aufmerksam machen:
          </Label>
          <ActionBar share={shareObject} />
        </div>

        <H1>Community</H1>
        <P>
          Die Republik kann nicht ein Projekt von wenigen sein. Ein neues
          Fundament f??r unabh??ngigen Journalismus bauen wir nur gemeinsam ??? oder
          gar nicht. Sehen Sie hier, wer schon an Bord ist:
        </P>
        <div style={{ margin: '20px 0' }}>
          <TestimonialList
            first={10}
            onSelect={(id) => {
              Router.push(`/community?id=${id}`).then(() => {
                window.scrollTo(0, 0)
              })
              return false
            }}
          />
        </div>

        <Link href='/community' passHref>
          <A>Alle ansehen</A>
        </Link>

        <br />
        <br />
        <br />
      </ContainerWithSidebar>
    </Frame>
  )
}

export default withDefaultSSR(withRouter(withT(withInNativeApp(Page))))
