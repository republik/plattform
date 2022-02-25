import React, { useMemo } from 'react'
import colors from '../../../theme/colors'
import { getFormatLine } from '../../../components/TeaserFeed/utils'

export default ({ meta }) => {
  const { slug, path, format } = meta

  // support for old format string pending backend change
  // https://github.com/orbiting/backends/compare/feat-article-email
  // specifically resolved meta object
  // https://github.com/orbiting/backends/commit/cce72915353d60c3cd3b4ecafefa3a11fb092933
  const isCovid19 =
    (typeof format === 'string' &&
      format.includes('format-covid-19-uhr-newsletter')) ||
    format?.repoId?.includes('format-covid-19-uhr-newsletter')

  const formatLine = useMemo(() => {
    return getFormatLine({
      format: meta.format,
      series: meta.series,
      repoId: meta.repoId,
      path: meta.path,
    })
  }, [meta])

  return (
    <>
      <tr>
        <td
          align='center'
          valign='top'
          style={{
            borderBottom:
              formatLine && formatLine.color
                ? `3px solid ${formatLine.color}`
                : `1px solid ${colors.divider}`,
          }}
        >
          <a
            href={`https://www.republik.ch${path ? path : `/${slug}`}`}
            title='Im Web lesen'
          >
            <img
              height='79'
              width={isCovid19 ? 234 : 178}
              src={`https://www.republik.ch/static/logo_republik_newsletter${
                isCovid19 ? '_covid19_wave3' : ''
              }.png`}
              style={{
                border: 0,
                width: `${isCovid19 ? 234 : 178}px !important`,
                height: '79px !important',
                margin: 0,
                maxWidth: '100% !important',
              }}
              alt='REPUBLIK'
            />
          </a>
        </td>
      </tr>
    </>
  )
}
