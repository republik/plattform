import React from 'react'
import HR from './HR'
import Center from './Center'
import colors from '../../styleguide-clone/theme/colors'
import { fontFamilies } from '../../styleguide-clone/theme/fonts'

import {
  paragraphStyle,
  linkStyle,
} from '../../newsletter/components/Paragraph'
import { matchProjectR } from '../util/project-r'

const footerParagraphStyle = {
  color: colors.text,
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: '15px',
  lineHeight: '30px',
}

const footerLinkStyle = {
  ...linkStyle,
  color: colors.text,
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: '15px',
  lineHeight: '30px',
}

const ProjectRFooter = () => (
  <>
    <a href='https://project-r.ch/' style={linkStyle}>
      <img
        src='https://assets.project-r.ch/images/project_r_logo_newsletter.png'
        style={{
          border: 0,
          width: '50px !important',
          height: '50px !important',
          margin: '30px 0 20px',
          maxWidth: '100% !important',
        }}
        width='50'
        height='50'
        alt=''
      />
    </a>
    <p style={{ ...paragraphStyle, marginTop: 0 }}>
      Project R Genossenschaft, Sihlhallenstrasse 1, 8004 Zürich
    </p>
  </>
)

const Footer = ({ meta }) => {
  const { slug, path, format } = meta
  const isProjectR = matchProjectR(format)
  const baseUrl = isProjectR
    ? 'https://project-r.ch/newsletter'
    : 'https://www.republik.ch'
  return (
    <Center>
      <p style={footerParagraphStyle}>
        <a
          href={`${baseUrl}${path ? path : `/${slug}`}`}
          style={footerLinkStyle}
        >
          Im Web lesen
        </a>
      </p>
      <p style={footerParagraphStyle}>
        Alle unsere Newsletter:<br/>
        <a href= 'https://www.republik.ch/format/7-uhr-newsletter' style={footerLinkStyle} >Republik heute</a> |{' '} 
        <a href='https://www.republik.ch/format/was-diese-woche-wichtig-war' style={footerLinkStyle}>Was diese Woche wichtig war</a> |{' '} 
        <a href='https://www.republik.ch/format/wochenend-newsletter' style={footerLinkStyle}>Republik am Wochenende</a> |{' '} 
        <a href='https://www.republik.ch/challenge-accepted' style={footerLinkStyle}>Challenge Accepted</a> |{' '} 
        <a href='https://www.republik.ch/format/project-r-newsletter' style={footerLinkStyle}>Project R</a>
      </p>
      <p style={footerParagraphStyle}>
        Um{' '}
        <a
          href='https://www.republik.ch/konto/newsletter'
          style={footerLinkStyle}
        >
          Ihre Newsletter-Einstellungen einzusehen und anzupassen
        </a>
        , öffnen Sie «Konto» in der Republik-App oder auf{' '}
        <a
          href='https://www.republik.ch/konto/newsletter'
          style={footerLinkStyle}
        >
          republik.ch
        </a>
        .{' '}
        <a href='*|UNSUB|*' style={footerLinkStyle}>
          Alle Newsletter sofort pausieren
        </a>
      </p>
      <HR />
      <a href='https://www.republik.ch/' style={linkStyle}>
        <img
          height='79'
          width='178'
          src='https://www.republik.ch/static/logo_republik_newsletter.png'
          style={{
            border: 0,
            width: '178px !important',
            height: '79px !important',
            margin: 0,
            maxWidth: '100% !important',
          }}
          alt='REPUBLIK'
        />
      </a>
      <p style={{ ...paragraphStyle, marginTop: 0 }}>
        Republik AG, Sihlhallenstrasse{'&#8288;'} 1, 8004{'&#8288;'} Zürich
      </p>
      {isProjectR && <ProjectRFooter />}
    </Center>
  )
}

export default Footer
