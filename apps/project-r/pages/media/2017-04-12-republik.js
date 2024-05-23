import React from 'react'
import Link from 'next/link'

import Layout from '../../src/Layout'

export default function Page() {
  const meta = {
    title: 'Das Magazin von Project R heisst «Republik»',
    description:
      'Am heutigen 12. April, dem Jahrestag der Ausrufung der Helvetischen Republik, enthüllt das Medienprojekt in Bern den Namen des geplanten digitalen Magazins. Das Crowdfunding startet am 26. April.',
    image: 'https://assets.project-r.construction/images/logo_republik.jpg',
  }

  return (
    <Layout meta={meta}>
      <h1>Medieninformation</h1>
      <p>Bern, 12. April 2017</p>
      <p>
        <em>
          Dem Journalismus seine Rolle als verlässlicher Wachhund der Demokratie
          geben
        </em>
      </p>

      <h2>Das Magazin von Project R heisst «Republik»</h2>

      <p>
        <strong>
          Die Project-R-Crew hat heute den Namen des geplanten digitalen
          Magazins präsentiert: «Republik». Das Magazin soll erstmals Anfang
          2018 erscheinen. In ihrem Manifest definiert das Aufbau-Team des
          Medienprojekts die Rolle des Journalismus in einer freiheitlichen
          Gesellschaft und hält damit seinen publizistischen Anspruch fest.
        </strong>
      </p>

      <p>
        An ihrer Medienorientierung während ihres «Tags der offenen Türe» im
        Berner Zentrum für Kulturproduktion PROGR enthüllte die Project-R-Crew
        Name und Logo des geplanten Magazins. Und sie stellte ihr Manifest zur
        «Vierten Gewalt» in einer freiheitlichen Gesellschaft vor. Das digitale
        Magazin wird «Republik» heissen.
      </p>

      <p>
        {' '}
        Das heutige Datum für die Namens-Präsentation ist nicht zufällig
        gewählt: Vor 219 Jahren, am 12. April 1798, wurde in Aarau die
        Helvetische Republik ausgerufen. Das Datum markiert die Geburt der
        modernen Schweiz. Erstmals garantierte eine Verfassung Gewaltenteilung,
        Gleichheit vor dem Gesetz, Wahlen und Pressefreiheit. Claude Longchamp,
        Historiker und Politologe, erörterte in seinem Input-Referat an der
        Medienorientierung die republikanischen Werte und setzte diese in den
        aktuellen politischen Kontext. Anschliessend diskutierten, unter der
        Leitung des Berner Kommunikationsfachmanns Mark Balsiger, Claude
        Longchamp, die Historikerin Nanina Egli und Christof Moser von Project R
        Sinn und Zweck der republikanischen Grundwerte in einer demokratischen
        Gesellschaft.
      </p>

      <h3>«Republik»-Crowdfunding startet am 26. April</h3>

      <p>
        Die bereits zugesagten Investoren- und Spendengelder von 3,5 Millionen
        Franken sind an den Erfolg des Crowdfundings gekoppelt. Die «Republik»
        braucht 3000 Unterstützerinnen und Unterstützer, die zusammen mindestens
        CHF 750'000.- aufbringen. Das Crowdfunding startet am 26. April 2017.
      </p>

      <p>
        Finden Sie mehr unter: <Link href='/'>project-r.construction</Link>
        <br />
        Link zum aktuellen Newsletter:{' '}
        <Link href='/newsletter/2017-04-12-republik'>
          Das Magazin von Project R
        </Link>
        <br />
        Das Manifest im Wortlaut:{' '}
        <a href='https://republik.ch/manifest'>republik.ch/manifest</a>
      </p>

      <p>
        <a href='https://assets.project-r.construction/media/170412.zip'>
          Medienbilder und Logo herunterladen
        </a>
      </p>

      <h3>Vorgesehener Zeitrahmen</h3>

      <p>
        <strong>Start Crowdfunding: </strong>26. April 2017
        <br />
        <strong>Ende Crowdfunding: </strong>31. Mai 2017
        <br />
        <strong>Aufbau der Redaktion: </strong>ab Sommer 2017
        <br />
        <strong>Start «Republik»: </strong>Anfang 2018
      </p>

      <p>
        <strong>Die Project R Genossenschaft</strong> nimmt sich der
        Weiterentwicklung und Stärkung des Journalismus an. Dazu gehören
        Projekte wie der Bau einer digitalen Open-Source-Infrastruktur, das
        Durchführen von Veranstaltungen und Debatten, das Entwickeln neuer
        journalistischer Formate sowie die Ausbildung von jungen Journalistinnen
        und Journalisten.
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
    </Layout>
  )
}
