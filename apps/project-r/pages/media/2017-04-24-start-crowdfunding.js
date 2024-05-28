import React from 'react'

import Layout from '../../src/Layout'

export default function Page() {
  const meta = {
    title: 'Ein bisschen Mitbesitzerin von «Republik» werden',
    description:
      "Punkt 07.00 Uhr, am 26. April 2017 startet unter republik.ch das Crowdfunding für das digitale Magazin «Republik»; online und im Hotel Rothaus vor Ort. Bis Ende Mai will die Project-R-Crew 3000 zukünftige Leserinnen und Leser finden, die insgesamt mindestens 750'000 Franken investieren.",
    image: 'https://assets.project-r.construction/images/taufe_bern.jpg',
  }

  return (
    <Layout meta={meta}>
      <h1>Medieninformation</h1>
      <p>Zürich, 24. April 2017</p>
      <p>
        <em>Markttest per Crowdfunding</em>
      </p>

      <h2>Ein bisschen Mitbesitzerin von «Republik» werden</h2>

      <p>
        <strong>
          Punkt 07.00 Uhr, am 26. April 2017 startet unter{' '}
          <a href='https://www.republik.ch'>republik.ch</a> das Crowdfunding für
          das digitale Magazin «Republik»; online und im Hotel Rothaus vor Ort.
          Bis Ende Mai will die Project-R-Crew 3000 zukünftige Leserinnen und
          Leser finden, die insgesamt mindestens 750'000 Franken investieren.
        </strong>
      </p>

      <p>
        Der Startschuss für das Crowdfunding wird bunt. Er ist Punkt 07.00 Uhr
        im Hotel Rothaus. Die ersten Abonnemente und Mitgliedschaften können{' '}
        <strong>ab 07.00 Uhr</strong> im Hotel Rothaus gelöst werden, an der
        Zürcher Langstrasse, direkt vor Ort bei der Project-R-Crew. Es gibt
        Kaffee, Gipfeli und Musik. Das Crowdfunding ist unter{' '}
        <a href='https://www.republik.ch'>republik.ch</a> zu finden und startet
        gleichzeitig online um <strong>07.00 Uhr</strong>. Bis Ende Mai will die
        Project-R-Crew 3000 zukünftige Leserinnen und Leser finden, die zusammen
        750'000 Franken investieren. Das Crowdfunding ist zugleich Markttest.
        Die Crew wird das digitale Massenmedium nur verwirklichen, wenn es eine
        Nachfrage für ein solches gibt. Wird das Ziel erreicht, fliessen
        zusätzlich die bereits zugesagten Mittel von Investorinnen und Spendern
        in der Höhe von 3,5 Millionen Franken.
      </p>

      <h3>Für einen Kaffee pro Woche in einem Restaurant</h3>

      <p>
        Ein Jahresabonnement des «Republik»-Magazins kostet 240 Franken. Wer
        diese Summe im Crowdfunding einzahlt, wird für ein Jahr (2018) Abonnent
        des digitalen Magazins und gleichzeitig Mitglied der Project R
        Genossenschaft (bis Ende 2018). Die Mitglieder der Project R
        Genossenschaft sind Mitbesitzer des Unternehmens Republik AG und damit
        ein wenig Verlegerin und Verleger. Die Investition für das Publikum ist
        überschaubar. Der Preis von 240 Franken pro Jahr entspricht einem
        wöchentlichen Kaffee in einem Restaurant.
      </p>

      <h3>Crowdfunding</h3>

      <p>
        <strong>Start Crowdfunding: </strong>26. April 2017
        <br />
        <strong>Ende Crowdfunding: </strong>31. Mai 2017
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
        <strong>Die Project R Genossenschaft</strong> nimmt sich der
        Weiterentwicklung und Stärkung des Journalismus an. Dazu gehören
        Projekte wie der Bau einer digitalen Open-Source-Infrastruktur, das
        Durchführen von Veranstaltungen und Debatten, das Entwickeln neuer
        journalistischer Formate sowie die Ausbildung von jungen Journalistinnen
        und Journalisten.
      </p>
    </Layout>
  )
}
