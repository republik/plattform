import React from 'react'

import Layout from '../src/Layout'
import Cover from '../src/Cover'

import VideoPlayer from '../src/VideoPlayer'

const teamVideo = {
  hls: 'https://player.vimeo.com/external/213078685.m3u8?s=09907679a29279449533845fa451ef9a3754da02',
  mp4: 'https://player.vimeo.com/external/213078685.hd.mp4?s=150318d6e82f1f342442340bade748be38280e61&profile_id=175',
  subtitles: '/static/subtitles/team.vtt',
  poster: `/static/video/team.jpg`,
}

export default function ManifestPage() {
  const meta = {
    title: 'Manifest',
    description: 'Lat. manifestus = sichtbar gemacht, handgreiflich gemacht.',
    image: 'https://assets.project-r.construction/images/header_manifest.jpg',
  }

  return (
    <Layout
      meta={meta}
      cover={
        <Cover
          image={{
            src: meta.image,
            alt: 'Balkon vom Hotel Rothaus mit gehisstem Project R Logo',
          }}
        >
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </Cover>
      }
    >
      <p>
        Unser Manifest bringt auf den Punkt, wofür wir stehen. Es entstand im
        Winter 2016/2017 im Gründerteam von Project R und der «Republik». Am
        12. April 2017 haben wir es in Bern präsentiert.
      </p>

      <VideoPlayer subtitles src={teamVideo} />

      <p>
        <br />
        <a
          href='https://assets.project-r.construction/media/manifest.pdf'
          target='_blank'
        >
          Manifest als PDF herunterladen
        </a>
      </p>
      <p>
        Wollen Sie uns unterstützen, indem Sie das Manifest öffentlich
        aufhängen? Das würde uns freuen! Holen Sie Ihr kostenloses
        DIN-A3-Poster-Manifest hier bei uns im Hotel Rothaus ab. Bitte kurz
        vorher Bescheid sagen:{' '}
        <a
          style={{ whiteSpace: 'nowrap' }}
          href='mailto:office@project-r.construction'
        >
          office@project-r.construction
        </a>
      </p>
    </Layout>
  )
}
