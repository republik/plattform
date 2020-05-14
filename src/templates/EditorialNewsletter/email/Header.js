import React from 'react'
import colors from '../../../theme/colors'
import { fontFamilies } from '../../../theme/fonts'

import { linkStyle } from './Paragraph'

const ctaParagraphStyle = {
  color: colors.text,
  margin: '10px',
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: '16px',
  lineHeight: '30px'
}

const ctaLinkStyle = {
  ...linkStyle,
  color: colors.text,
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: '16px',
  lineHeight: '30px'
}

export default ({ meta }) => {
  const { slug, path, format } = meta

  const isCovid19 =
    format && format.indexOf('format-covid-19-uhr-newsletter') !== -1

  return (
    <>
      <tr>
        <td
          align='center'
          valign='top'
          style={{
            borderBottom: !isCovid19 ? `1px solid ${colors.divider}` : undefined
          }}
        >
          <a
            href={`https://www.republik.ch${path ? path : `/${slug}`}`}
            title='Im Web lesen'
          >
            <img
              height='79'
              width={isCovid19 ? 217 : 178}
              src={`https://www.republik.ch/static/logo_republik_newsletter${
                isCovid19 ? '_covid19' : ''
              }.png`}
              style={{
                border: 0,
                width: `${isCovid19 ? 217 : 178}px !important`,
                height: '79px !important',
                margin: 0,
                maxWidth: '100% !important'
              }}
              alt='REPUBLIK'
            />
          </a>
        </td>
      </tr>
      {isCovid19 && (
        <>
          *|INTERESTED:Customer:Member,Geteilter Zugriff|* *|ELSE:|*
          *|IFNOT:COVID19_AG|*
          <tr>
            <td
              align='center'
              valign='top'
              style={{ backgroundColor: colors.primaryBg }}
            >
              <p style={ctaParagraphStyle}>
                Neugierig auf die ganze Republik?{' '}
                <a
                  href='https://www.republik.ch/probelesen?campaign=covid-19-uhr-newsletter&email=*|EMAILB64U|*&token=*|AS_ATOKEN|*'
                  style={ctaLinkStyle}
                >
                  Jetzt ausprobieren
                </a>
              </p>
            </td>
          </tr>
          *|END:IF|* *|END:INTERESTED|*
        </>
      )}
    </>
  )
}
