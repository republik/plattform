import React from 'react'
import {css} from 'glamor'

const tableStyle = css({
  borderSpacing: '20px 0',
  '@media (max-width: 600px)': {
    fontSize: 14
  },
  '@media (min-width: 321px) and (max-width: 600px)': {
    borderSpacing: '10px 0'
  },
  '& th': {
    fontStyle: 'italic'
  },
  '& th, & td': {
    textAlign: 'left',
    verticalAlign: 'top',
    borderBottom: '1px solid #000',
    paddingTop: 3,
    paddingBottom: 20
  },
  '& tr:last-child th, & tr:last-child td': {
    borderBottom: 'none'
  }
})
const PADDING = 20

export default () => (
  <div style={{overflowX: 'auto', overflowY: 'hidden', marginLeft: -PADDING, marginRight: -PADDING}}>
    <table {...tableStyle}>
      <tbody>
        <tr>
          <th />
          <td>
            <img
              style={{height: 40, marginBottom: 10}}
              src='https://assets.project-r.construction/images/project_r_logo.svg' /><br />
            Genossenschaft
          </td>
          <td>
            <img
              style={{height: 40, marginLeft: -10, marginBottom: 10}}
              src='https://assets.project-r.construction/images/magazine_logo.png' /><br />
            Aktiengesellschaft
          </td>
        </tr>
        <tr>
          <th>Name:</th>
          <td>Project R</td>
          <td>(noch ein Geheimnis)</td>
        </tr>
        <tr>
          <th>Zweck:</th>
          <td>
            <p>Alles Institutionelle.</p>
            <p>Dem Journalismus seine Rolle in der Demokratie sichern.</p>
            <p>
              <em>Gemeinnützig;</em><br />
              mitglieder-, spenden- und stiftungsfinanziert
            </p>
          </td>
          <td>
            <p>Alles Journalistische.</p>
            <p>Das digitale Magazin herstellen.</p>
            <p>
              <em>Gewinnorientiert</em><br />
              (mit dem Ziel, mindestens selbsttragend zu werden)
            </p>
          </td>
        </tr>
        <tr>
          <th>Aufgaben:</th>
          <td>
            <p>Alles, was Journalismus schützt und voranbringt</p>
            <ul>
              <li>Entwicklung und Weiterentwicklung journalistischer Formate</li>
              <li>Nachwuchsförderung, Aus- und Weiterbildung</li>
              <li>Entwicklung IT-Infrastruktur (Open Source)</li>
              <li>Veranstaltungen</li>
              <li>Sensibilisierung von Öffentlichkeit für unabhängigen Journalismus</li>
              <li>Mittelbeschaffung, Recherchefonds</li>
              <li>Rechtliches</li>
              <li>Kooperationen</li>
            </ul>
          </td>
          <td>
            <p>Journalismus</p>
            <ul>
              <li>Redaktion, Produktion und Vertrieb des digitalen Magazins</li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)
