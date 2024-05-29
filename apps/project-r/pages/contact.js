import React from 'react'

import Layout from '../src/Layout'
import Cover from '../src/Cover'
import Link from 'next/link'
import Newsletter from '../src/Newsletter'

export default function Contactpage({}) {
  const meta = {
    title: 'Newsletter von Project R',
    description: 'Jetzt E-Mail-Adresse eintragen und auf dem Laufenden bleiben',
    image: 'https://assets.project-r.construction/images/rothaus.jpg',
  }

  return (
    <Layout
      meta={meta}
      cover={
        <Cover
          image={{
            src: 'https://assets.project-r.construction/images/rothaus.jpg',
            alt: 'Das Hotel Rothaus an der Langstrasse mit einem Project R Logo auf dem Balkon',
          }}
        >
          <h1>Newsletter und Kontakt</h1>
        </Cover>
      }
    >
      <p>
        Wenn Sie informiert bleiben wollen, bitte hier für den Newsletter
        eintragen:
      </p>

      <Newsletter />

      <p>Danke!</p>

      <p>
        Mehr zu Project R:{' '}
        <Link href='/'>
          <a>project-r.construction</a>
        </Link>
      </p>

      <p>
        <strong>E-Mail</strong>
        <br />
        <a href='mailto:office@project-r.construction'>
          office@project-r.construction
        </a>
        <br />
        PGP-Key-ID: 6A1DB6B9
        <br />
        <a href='https://assets.project-r.construction/contact/0x6A1DB6B9_office.asc'>
          Key herunterladen
        </a>
      </p>
    </Layout>
  )
}
