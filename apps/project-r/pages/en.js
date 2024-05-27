import React from 'react'
import Layout from '../src/Layout'
import Cover from '../src/Cover'
import VideoPlayer from '../src/VideoPlayer'

const enVideo = {
  hls: 'https://player.vimeo.com/external/215798102.m3u8?s=b3730f7f6332985771865f3b85c13aeae93223b1',
  mp4: 'https://player.vimeo.com/external/215798102.hd.mp4?s=bdc8421b7d1c2a04fcf9521655332e54c7c4c039&profile_id=175',
  subtitles: '/static/subtitles/main_en.vtt',
  poster: `/static/video/main.jpg`,
}

export default function EnPage() {
  const meta = {
    title: 'Project R',
    description:
      'Project R is a Switzerland-based cooperative fighting for independent journalism, freedom of expression, public debate and a functioning democracy.',
    image: 'https://assets.project-r.construction/images/header_front.jpg',
  }

  return (
    <Layout
      meta={meta}
      cover={
        <Cover
          image={{
            src: 'https://assets.project-r.construction/images/header_front.jpg',
            alt: 'Balkon vom Hotel Rothaus mit gehisstem Project R Logo',
          }}
        >
          <h1>Project R</h1>
          <p>{meta.description}</p>
        </Cover>
      }
    >
      <p>
        We are reclaiming journalism as a profession and are creating a new
        business model that places our readers at the center. Our digital
        magazine <a href='https://www.republik.ch'>«Republik»</a> (in German)
        launched in January 2018. «Republik» is reader-owned, independent and
        ad-free.
      </p>

      <VideoPlayer subtitles src={enVideo} />

      <p>
        <br />
        Project R is an open-source cooperative, and we share our knowledge,
        software and business insights with other projects who also want to
        foster democracy and free speech around the world.
      </p>

      <p>
        In May 2017, we collected about € 3.1m in a crowdfunding campaign in
        which we sold nearly 14'000 memberships. We started publishing in
        January 2018 and now have over 20'000 members that support our mission.
      </p>

      <p>
        Read more about our crowdfunding here: <br />
        <a href='https://www.cjr.org/innovations/news-startup-crowdfunding-switzerland.php'>
          Columbia Journalism Review: ‘Startup that promises ‘no-bullshit
          journalism’ nets serious cash’
        </a>
        .
      </p>

      <p>
        Our manifesto sums up what we stand for. Download the manifesto{' '}
        <a href='https://assets.project-r.construction/media/manifesto_en.pdf'>
          here
        </a>
        .
      </p>

      <p>
        <a href='https://www.republik.ch/en'>Here</a> you can donate and read
        more about «Republik».
      </p>
    </Layout>
  )
}
