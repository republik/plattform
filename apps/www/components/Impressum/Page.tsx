import { EmployeeRecord } from '#graphql/cms/__generated__/gql/graphql'
import { A, Interaction } from '@project-r/styleguide'
import { useInNativeApp } from '../../lib/withInNativeApp'

import Employees from './Employees'

const { H1, H2, P } = Interaction

export default function Impressum({ data }: { data: EmployeeRecord[] }) {
  const { inNativeApp } = useInNativeApp()
  const meta = {
    title: 'Impressum',
    description: '',
  }

  return (
    <>
      <H1>{meta.title}</H1>

      <br />
      <H2>Verlegerinnen und Verleger</H2>
      <P>
        <A href='/community'>Alle Mitglieder</A> der{' '}
        <A href='https://project-r.ch'>Project R Genossenschaft</A>
      </P>
      <br />
      <br />
      <H2>Herausgeberin</H2>
      <P>
        Republik AG
        <br />
        Sihlhallenstrasse 1<br />
        8004 Zürich
        <br />
        Schweiz
      </P>

      <br />
      <P>
        <A href='mailto:kontakt@republik.ch'>kontakt@republik.ch</A> <br />
        <A href='tel:+41445056780'>+41 44 505 67 80</A>
      </P>

      <br />
      <P>
        Anonyme oder vertrauliche Kontaktaufnahme:{' '}
        <A href='/vertraulich'>republik.ch/vertraulich</A>
      </P>

      <br />
      <P>
        <A href='https://drive.google.com/open?id=14YQ_IR6HRoXUwrfjc_KJQ_lGjMXjaFO1'>
          Medienbilder und Logo herunterladen
        </A>
      </P>
      <br />
      <br />

      <Employees employees={data} />

      <H2>Aktionariat</H2>
      <P>
        <A href='/aktionariat'>republik.ch/aktionariat</A>
      </P>

      <br />

      <H2>Mediadaten</H2>
      <P>Keine vorhanden. Die Republik ist komplett werbefrei.</P>
      <br />

      <H2>Beteiligungen</H2>
      <P>
        Bekanntgabe von namhaften Beteiligungen der Republik AG i. S. v. Art.
        322 StGB: <br />
        Keine Beteiligungen.
      </P>

      <br />
      <H2>Handelsregistereintrag</H2>
      <P>
        <A href='https://zh.chregister.ch/cr-portal/auszug/auszug.xhtml?uid=CHE-256.391.251'>
          Republik AG
        </A>
      </P>

      <br />

      <H2>Publizistische Leitlinien</H2>
      <P>
        <A href='/manifest'>republik.ch/manifest</A>
      </P>
      <br />

      {!inNativeApp && (
        <>
          <H2>Mitgliedschaften und Abonnements</H2>
          <P>
            <A href='/angebote'>republik.ch/angebote</A>
          </P>
          <br />
        </>
      )}
      <H2>Dank</H2>
      <P>
        Die Republik entstand aus einem Projekt, das 2010 begann. Bis zur ersten
        Publikation haben hunderte Menschen in ihrer Freizeit das Projekt
        unterstützt und vorangetrieben. Ohne sie gäbe es die Republik nicht. Wir
        sind jeder einzelnen Komplizin, jedem einzelnen Komplizen von ganzem
        Herzen dankbar für die Unterstützung.
      </P>
      <br />
      <H2>Rechtliches</H2>
      <P>
        Die in diesem Impressum erwähnten Personen dürfen nicht in einer Kartei
        gespeichert werden und ihre Namen und E-Mail-Adressen nicht ohne
        Einverständnis der genannten Personen genutzt werden.
      </P>

      <br />
      <H2>Disclaimer</H2>
      <P>
        Alle Texte und Links wurden sorgfältig geprüft und werden laufend
        aktualisiert. Wir sind bemüht, richtige und vollständige Informationen
        auf dieser Website bereitzustellen, übernehmen aber keinerlei
        Verantwortung, Garantien oder Haftung dafür, dass die durch diese
        Website bereitgestellten Informationen, einschliesslich jeglicher
        Datenbankeinträge, richtig, vollständig oder aktuell sind.
      </P>
      <P>
        Wir behalten uns das Recht vor, jederzeit und ohne Vorankündigung die
        Informationen auf dieser Website zu ändern, und verpflichten uns auch
        nicht, die enthaltenen Informationen zu aktualisieren. Alle Links zu
        externen Anbietern wurden zum Zeitpunkt ihrer Aufnahme auf ihre
        Richtigkeit überprüft. Dennoch haften wir nicht für Inhalte und
        Verfügbarkeit von Websites, die mittels Hyperlinks zu erreichen sind.
      </P>
      <P>
        Für illegale, fehlerhafte oder unvollständige Inhalte und insbesondere
        für Schäden, die durch die ungeprüfte Nutzung von Inhalten verknüpfter
        Seiten entstehen, haftet allein der Anbieter der Seite, auf welche
        verwiesen wurde. Dabei ist es gleichgültig, ob der Schaden direkter,
        indirekter oder finanzieller Natur ist oder ein sonstiger Schaden
        vorliegt, der sich aus Datenverlust, Nutzungsausfall oder anderen
        Gründen aller Art ergeben könnte.
      </P>
    </>
  )
}
