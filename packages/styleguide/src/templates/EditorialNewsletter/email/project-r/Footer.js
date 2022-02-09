import Center from '../Center'
import React from 'react'

export const Footer = () => (
  <Center>
    <p>
      <a href='https://www.republik.ch/'>
        <img
          height='79'
          src='https://assets.project-r.construction/images/logo_republik_newsletter.png'
          style={{
            border: 0,
            width: '180px !important',
            height: '79px !important',
            margin: 0,
            maxWidth: '100% !important',
          }}
          width='180'
          alt=''
        />
      </a>
    </p>
    <p>
      Republik AG
      <br />
      Sihlhallenstrasse 1<br />
      8004 Zürich
    </p>
    <br />
    <p>
      <a href='https://project-r.construction/'>
        <img
          src='https://assets.project-r.construction/images/project_r_logo_newsletter.png'
          style={{
            border: 0,
            width: '50px !important',
            height: '50px !important',
            margin: 0,
            maxWidth: '100% !important',
          }}
          width='50'
          height='50'
          alt=''
        />
      </a>
    </p>
    <br />
    Project R Genossenschaft
    <br />
    Sihlhallenstrasse 1<br />
    8004 Zürich
    <br />
    <hr />
    <p>
      <a href='*|UNSUB|*'>Vom Newsletter abmelden</a>
    </p>
  </Center>
)
