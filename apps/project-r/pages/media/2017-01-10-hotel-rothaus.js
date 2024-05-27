import React from 'react'

import Layout from '../../src/Layout'

export default function HotelRothausPage() {
  const meta = {
    title: 'Project R stellt Aufbau-Crew vor und zieht ins Hotel Rothaus',
    description:
      'Die Aufbau-Crew von Project R hat Anfang Januar ihr provisorisches Domizil im Zürcher Kreis 4 bezogen. Dort treibt das Team die Konzeption und Entwicklung des Medienprojekts voran.',
    image: 'https://assets.project-r.construction/images/rothaus.jpg',
  }

  return (
    <Layout meta={meta}>
      <h1>Medieninformation</h1>
      <p>Zürich, 10. Januar 2017</p>
      <p>
        <em>
          Dem Journalismus seine Rolle als verlässlicher Wachhund der Demokratie
          geben
        </em>
      </p>

      <h2>Project R stellt Aufbau-Crew vor und zieht ins Hotel&nbsp;Rothaus</h2>

      <p>
        <strong>
          Die Aufbau-Crew von Project R hat Anfang Januar ihr provisorisches
          Domizil im Zürcher Kreis 4 bezogen. Sie hat die Möglichkeit erhalten,
          3 Zimmer im Hotel Rothaus als Büros zu mieten. Dort treibt das Team
          die Konzeption und Entwicklung des Medienprojekts voran. Eine
          Genossenschaft sowie eine Produktions- und Vertriebs-AG stehen kurz
          vor der Gründung.
        </strong>
      </p>

      <p>
        Während sich die Schweizer Verleger und Medienmanager heute an der
        traditionellen Dreikönigstagung treffen, krabbelt das Wickelkind der
        Schweizer Presse ins Licht der Öffentlichkeit. Project R stellt seine
        Aufbau-Crew vor – und bezieht drei Zimmer im legendären Zürcher Hotel
        Rothaus als Geschäftssitz.
      </p>

      <p>
        Project R nimmt damit weiter an Fahrt auf. Seit Monaten arbeitet die
        Project R-Aufbau- Crew, gemeinsam mit ihren zahlreichen Komplizinnen und
        Komplizen im Hintergrund, an der Gesellschaftsform, dem
        Redaktionskonzept, dem Aufbau der Crowdfunding-Plattform, der
        IT-Entwicklung, der Positionierung, dem Pricing etc. Der Bezug der
        «Hotelzimmer» an der Langstrasse ermöglicht der Aufbau-Crew, nun noch
        intensiver zusammenzuarbeiten, um das Projekt im geplanten Zeitrahmen
        voranzutreiben. Die Zeit der «nur» Nachtarbeit ist damit vorbei.
      </p>

      <h3>Über Project R</h3>

      <p>
        Die grossen Verlage verlassen den Journalismus. Sie bauen sich in hohem
        Tempo zu Internet-Handelshäusern um und investieren nicht mehr in die
        Publizistik. Dies ist ein Problem für den Journalismus und eine Gefahr
        für die Demokratie. Es ist jetzt Zeit zu handeln. Deshalb entwickelt
        Project R ein neues, von Medienkonzernen unabhängiges Geschäftsmodell.
        Ziel ist es, dem Journalismus seine Rolle zu geben: als verlässlicher
        Wachhund der Demokratie.
      </p>

      <h3>Die Project R-Aufbau-Crew</h3>

      <ul>
        <li>Constantin Seibt, Konzeption und Redaktion</li>
        <li>Christof Moser, Konzeption und Redaktion</li>
        <li>Susanne Sugimoto, Geschäftsführung</li>
        <li>Laurent Burst, Strategie</li>
        <li>Nadja Schnetzler, Prozesse und Zusammenarbeit</li>
        <li>Clara Vuillemin, Head of IT</li>
        <li>Patrick Recher, Software-Entwicklung</li>
        <li>Thomas Preusse, Software-Entwicklung</li>
        <li>François Zosso, Finanzen</li>
      </ul>

      <p>
        Finden Sie mehr unter:{' '}
        <a href='https://project-r.construction/'>project-r.construction</a>
      </p>

      <h3>Vorgesehener Zeitrahmen</h3>

      <p>
        <strong>Januar/Februar 2017</strong>
        <br />
        Gründung der juristischen Gesellschaften
      </p>
      <p>
        <strong>Mai/Juni 2017</strong>
        <br />
        Crowdfunding
      </p>
      <p>
        <strong>ab Sommer 2017</strong>
        <br />
        Aufbau der Redaktion
      </p>
      <p>
        <strong>Anfang 2018</strong>
        <br />
        Start digitales Magazin
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
        <a href='https://assets.project-r.construction/media/170110.zip'>
          Pressebilder herunterladen
        </a>
      </p>
    </Layout>
  )
}
