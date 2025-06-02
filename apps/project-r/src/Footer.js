import React from 'react'
import Link from 'next/link'
import SocialMedia from './SocialMedia'
import Menu from './Menu'

const Footer = () => (
  <div>
    <Link href='/'>
      <img
        style={{ maxWidth: 50, marginBottom: 10, marginTop: 20 }}
        src='https://assets.project-r.construction/images/project_r_logo.svg'
      />
    </Link>

    <Menu />

    <SocialMedia />

    <p>
      <strong>Kontakt</strong>
      <br />
      Project R Genossenschaft
      <br />
      Sihlhallenstrasse 1<br />
      8004 Zürich
      <br />
      <a href='mailto:office@project-r.construction'>
        office@project-r.construction
      </a>
      <br />
    </p>

    <p>
      <strong>Rechtliches</strong>
      <br />
      <a href='https://cdn.repub.ch/s3/republik-assets/assets/statuten-statuen/statuten_project_r_genossenschaft_20201122.pdf'>
        Statuten
      </a>
    </p>

    <p>
      <strong>Vorstand</strong>
      <br />
      <a href='https://www.republik.ch/~mhuissoud'>
        Michel&nbsp;Huissoud
      </a>, <a href='https://www.republik.ch/~klandolt'>Karin&nbsp;Landolt</a>,{' '}
      <a href='https://www.republik.ch/~nscheu'>Nina&nbsp;Scheu</a> und{' '}
      <a href='https://www.republik.ch/~123456789'>Moritz Zumbuehl</a>
    </p>

    <p>
      <a href='https://www.republik.ch/format/genossenschaftsrat'>
        <strong>Genossenschaftsrat</strong>
      </a>
    </p>

    <p>
      <strong>Spendenkonto</strong>
      <br />
      Project R Genossenschaft
      <br />
      Sihlhallenstrasse 1<br />
      8004 Zürich
      <br />
      Raiffeisenbank Winterthur
      <br />
      IBAN: CH06 8080 8006 3318 5396 1
    </p>
  </div>
)

export default Footer
