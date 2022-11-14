import React, { useMemo } from 'react'
import colors from '../../../theme/colors'
import { getFormatLine } from '../../../components/TeaserFeed/utils'
import { matchProjectR } from './project-r/utils'

export default ({ meta }) => {
  const { slug, path, format } = meta

  const isProjectR = matchProjectR(format)

  if (isProjectR) return null

  // support for old format string pending backend change
  // https://github.com/orbiting/backends/compare/feat-article-email
  // specifically resolved meta object
  // https://github.com/orbiting/backends/commit/cce72915353d60c3cd3b4ecafefa3a11fb092933
  const isCovid19 =
    (typeof format === 'string' &&
      format.includes('format-covid-19-uhr-newsletter')) ||
    format?.repoId?.includes('format-covid-19-uhr-newsletter')

  const isWinter =
    (typeof format === 'string' &&
      format.includes('format-winter-is-coming')) ||
    format?.repoId?.includes('format-winter-is-coming')

  const width = (isCovid19 && 234) || (isWinter && 232) || 178
  const imageFile =
    (isCovid19 && 'logo_republik_newsletter_covid19_wave3.png') ||
    (isWinter && 'logo_republik_newsletter_winter_wave-1.png') ||
    'logo_republik_newsletter.png'

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
              width={width}
              src={`https://www.republik.ch/static/${imageFile}`}
              style={{
                border: 0,
                width: `${width}px !important`,
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
