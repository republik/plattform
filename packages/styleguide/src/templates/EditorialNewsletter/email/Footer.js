import HR from './HR'
import React from 'react'
import Center from './Center'
import colors from '../../../theme/colors'
import { fontFamilies } from '../../../theme/fonts'

import { paragraphStyle, linkStyle } from './Paragraph'

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

const Footer = ({ meta }) => {
  const { slug, path } = meta
  return (
    <Center>
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
        Republik AG
        <br />
        Sihlhallenstrasse 1<br />
        8004 Zürich
      </p>
      <HR />
      <p style={footerParagraphStyle}>
        <a
          href={`https://www.republik.ch${path ? path : `/${slug}`}`}
          style={footerLinkStyle}
        >
          Im Web lesen
        </a>
      </p>
      <p style={footerParagraphStyle}>
        Um{' '}
        <a
          href='https://www.republik.ch/konto#newsletter'
          style={footerLinkStyle}
        >
          Ihre Newsletter-Einstellungen einzusehen und anzupassen
        </a>
        , öffnen Sie «Konto» in der Republik-App oder auf{' '}
        <a
          href='https://www.republik.ch/konto#newsletter'
          style={footerLinkStyle}
        >
          republik.ch
        </a>
        .{' '}
        <a href='*|UNSUB|*' style={footerLinkStyle}>
          Alle Newsletter sofort pausieren
        </a>
      </p>
    </Center>
  )
}

export default Footer
