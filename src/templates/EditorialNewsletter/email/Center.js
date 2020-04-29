import React from 'react'
import { fontFamilies } from '../../../theme/fonts'
import { paragraphStyle, linkStyle } from './Paragraph'
import HR from './HR'
import { Mso } from 'mdast-react-render/lib/email'
import colors from '../../../theme/colors'

import { Button } from './Button'
import Paragraph from './Paragraph'

const footerParagraphStyle = {
  color: colors.text,
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: '15px',
  lineHeight: '30px'
}

const footerLinkStyle = {
  ...linkStyle,
  color: colors.text,
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: '15px',
  lineHeight: '30px'
}

export default ({ children, meta }) => {
  const { slug, path, format } = meta

  const isCovid19 =
    format && format.indexOf('format-covid-19-uhr-newsletter') !== -1

  return (
    <tr>
      <td align='center' valign='top'>
        <Mso>
          {`
      <table cellspacing="0" cellpadding="0" border="0" width="600">
        <tr>
          <td>
        `}
        </Mso>
        <table
          align='center'
          border='0'
          cellPadding='0'
          cellSpacing='0'
          width='100%'
          style={{
            maxWidth: 600,
            color: '#000',
            fontSize: 19,
            fontFamily: fontFamilies.serifRegular
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: 20 }} className='body_content'>
                {children}
                {isCovid19 && (
                  <>
                    *|INTERESTED:Customer:Member,Geteilter Zugriff|* *|ELSE:|*
                    <Paragraph>
                      <strong>Neugierig auf die ganze Republik?</strong>
                      <br />
                      Jetzt kostenlos 14 Tage lang testen. Alle Newsletter, alle
                      Beiträge, alle Podcasts, alle Debatten entdecken – auf der
                      Website und in der App. Gratis, unverbindlich und ohne
                      Werbung, finanziert von unseren Leserinnen.
                    </Paragraph>
                    <Button
                      primary
                      href='https://www.republik.ch/probelesen?campaign=covid-19-uhr-newsletter&email=*|EMAILB64U|*&token=*|AS_ATOKEN|*'
                    >
                      Jetzt ausprobieren
                    </Button>
                    *|END:INTERESTED|*
                  </>
                )}
              </td>
            </tr>
            <tr>
              <td style={{ padding: 20 }}>
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
                      maxWidth: '100% !important'
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
                  , öffnen Sie «Konto» in der Republik-App oder auf republik.ch.{' '}
                  <a href='*|UNSUB|*' style={footerLinkStyle}>
                    Alle Newsletter sofort pausieren
                  </a>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <Mso>
          {`
      </td>
    </tr>
  </table>
        `}
        </Mso>
      </td>
    </tr>
  )
}
