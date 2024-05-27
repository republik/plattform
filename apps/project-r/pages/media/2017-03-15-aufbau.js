import React from 'react'
import Link from 'next/link'

import Layout from '../../src/Layout'

export default function Aufbaupage() {
  const meta = {
    title: 'Der Bauplan für das Geschäftsmodell von Project R steht',
    description:
      'Das Medienprojekt wird mit zwei Gesellschaftsformen aufgebaut. Die Struktur räumt dem Publikum eine gewichtige Stimme ein.',
    image:
      'https://assets.project-r.construction/images/enterprise_with_hand.jpg',
  }

  return (
    <Layout meta={meta}>
      <h1>Medieninformation</h1>
      <p>Zürich, 15. März 2017</p>
      <p>
        <em>
          Dem Journalismus seine Rolle als verlässlicher Wachhund der Demokratie
          geben
        </em>
      </p>

      <h2>Der Bauplan von Project R steht</h2>

      <p>
        <strong>
          Project R wird mit zwei Gesellschaftsformen gebaut. Die
          Doppel-Gesellschaftsstruktur mit Genossenschaft und AG sorgt für ein
          stabiles Fundament. Sie räumt den Leserinnen und Lesern eine
          gewichtige Stimme ein. Mittels Crowdfunding wird die Nachfrage am
          Lesermarkt getestet.
        </strong>
      </p>

      <p>
        Die letzten Monate haben es deutlich gezeigt: Die traditionellen
        Verlagshäuser ziehen sich weiter aus der Publizistik zurück. Eine
        flächendeckende Übernahme der Presse durch die grösste Partei des Landes
        scheint nach den jüngsten Vorkommnissen rund um die Blick-Gruppe alles
        andere als unwahrscheinlich. Project R baut jetzt ein neues
        Geschäftsmodell für einen unabhängigen Journalismus.
      </p>

      <h3>Mit dem Crowdfunding den Markt testen</h3>

      <p>
        Der Businessplan von Project R sieht ein digitales Magazin vor, das
        gross genug ist, in der öffentlichen Debatte Wirkung zu erzielen und
        schlank genug, um agil wachsen zu können. Mit dem Crowdfunding testet
        Project R, ob genügend Leserinnen und Leser bereit sind, für ein
        digitales Magazin zu bezahlen; ein Markttest in der Realität. Die
        bereits zugesagten Investorengelder von 3,5 Millionen Franken werden an
        den Erfolg des Crowdfundings gekoppelt. Das Project R-Team will 3000
        Leserinnen und Leser von ihrem Konzept überzeugen und CHF 750'000.-
        sammeln. Das heisst: Zu jedem ins Crowdfunding eingezahlten Franken
        kommen CHF 4.66. Bleibt das Crowdfunding erfolglos, wird im Juni
        ordentlich liquidiert. Das Crowdfunding startet{' '}
        <strong>Ende April 2017</strong> und dauert bis Ende Mai.
      </p>

      <h3>Geschäftsmodell mit zwei Gesellschaftsformen</h3>

      <p>
        Ist das Crowdfunding erfolgreich, wird sich künftig die bereits
        gegründete <strong>Project R Genossenschaft</strong> vorwiegend der
        Weiterentwicklung und Stärkung des Journalismus annehmen. Dazu gehören
        Projekte wie der Bau einer digitalen Open Source-Infrastruktur und die
        journalistische Aus- und Weiterbildung sowie Nachwuchsförderung. Die
        Genossenschaft unterstützt journalistische Projekte und neue Formate
        konzeptuell und finanziell. Ausserdem organisiert sie Veranstaltungen
        und Debatten. Eine schlanke Aktiengesellschaft wird sich ausschliesslich
        um die Produktion und den Vertrieb des digitalen Magazins kümmern.{' '}
      </p>

      <h3>Die Leserinnen und Leser haben eine gewichtige Stimme</h3>

      <p>
        Für Project R ist die publizistische Unabhängigkeit zentral. Die
        Doppelstruktur - Genossenschaft, Aktiengesellschaft - bietet
        diesbezüglich Vorteile. Denn bei der mitglieder-, spenden- und
        stiftungsfinanzierten Genossenschaft gilt: 1 Person, 1 Stimme. Jedes
        Genossenschaftsmitglied wird einen uneingeschränkten Zugang zum
        Digitalmagazin erhalten. Das Publikum wird via Genossenschaft zu rund 40
        Prozent am Aktienkapital des Magazins beteiligt. Die Mitarbeitenden
        halten knapp weniger als 40 Prozent und die Investorinnen und Investoren
        rund 20 Prozent der Aktien. Mit diesem Modell ist ein Gleichgewicht
        zwischen Publikum, Mitarbeitenden und Investoren gegeben. Die
        Aktiengesellschaft verdient ihr Geld mit dem Verkauf von Abonnements.
      </p>

      <h3>Der Vorstand der Project R Genossenschaft</h3>

      <p>
        Dem strategischen Gremium der Genossenschaft gehören die folgenden
        Personen an: Nadja Schnetzler als Präsidentin, Susanne Sugimoto als
        Geschäftsführerin und Mitglied des Vorstandes, Clara Vuillemin als
        Mitglied des Vorstandes, Laurent Burst als Mitglied des Vorstandes.
      </p>

      <p>
        Finden Sie mehr unter: <Link href='/'>project-r.construction</Link>
      </p>

      <h3>Vorgesehener Zeitrahmen</h3>

      <p>
        <strong>Ende April, Mai 2017:</strong> Crowdfunding
        <br />
        <strong>Ab Sommer:</strong> Aufbau der Redaktion
        <br />
        <strong>Anfang 2018:</strong> Start des digitalen Magazins
      </p>

      <p>
        Für weitere Auskünfte:
        <br />
        Susanne Sugimoto: +41 78 897 70 28,
        <br />
        <a href='mailto:susanne.sugimoto@project-r.construction'>
          susanne.sugimoto@project-r.construction
        </a>
      </p>
      <p>
        <a href='https://assets.project-r.construction/media/170315.zip'>
          Pressebilder herunterladen
        </a>
      </p>
    </Layout>
  )
}
