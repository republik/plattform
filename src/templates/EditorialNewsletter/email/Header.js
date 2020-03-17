import React from 'react'
import colors from '../../../theme/colors'

export default ({ meta }) => {
  const { slug, path, format } = meta

  const isCovid19 =
    format && format.indexOf('format-covid-19-uhr-newsletter') !== -1

  return (
    <tr>
      <td
        align='center'
        valign='top'
        style={{ borderBottom: `1px solid ${colors.divider}` }}
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
  )
}
