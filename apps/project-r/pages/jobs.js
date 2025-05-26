import React from 'react'

import Layout from '../src/Layout'
import Cover from '../src/Cover'

export default function JobsPage() {
  const meta = {
    title: 'Offene Stellen',
    description:
      'Löse mit einem motivierten, multidisziplinären Team die interessantesten Probleme der Branche.',
    image:
      'https://cdn.repub.ch/s3/republik-assets/assets/images/jobs.jpg?resize=2000x',
  }

  return (
    <Layout
      meta={meta}
      cover={
        <Cover
          image={{
            src: meta.image,
            alt: 'Weitwinkelfoto von vielen Republik-Mitarbeitern und Freunden mit brennender Geburtstagstorte in der Mitte.',
          }}
        >
          <h1>Jobs</h1>
          <p>
            Löse mit einem motivierten, multidisziplinären Team die
            interessantesten Probleme der Branche.
          </p>
        </Cover>
      }
    >
      <p>Derzeit keinen offenen Stellen</p>
    </Layout>
  )
}
