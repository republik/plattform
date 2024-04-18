import React, { useMemo } from 'react'
import colors from '../../../../theme/colors'
import { getFormatLine } from '../../../../components/TeaserFeed/utils'
import { matchProjectR } from '../../../EditorialNewsletter/email/project-r/utils'

export default function Header({ meta }) {
  const { slug, path, format } = meta

  const formatLine = useMemo(() => {
    return getFormatLine({
      format: meta.format,
      series: meta.series,
      repoId: meta.repoId,
      path: meta.path,
    })
  }, [meta])

  const isProjectR = matchProjectR(format)

  if (isProjectR) return null

  // support for old format string pending backend change
  // https://github.com/orbiting/backends/compare/feat-article-email
  // specifically resolved meta object
  // https://github.com/orbiting/backends/commit/cce72915353d60c3cd3b4ecafefa3a11fb092933
  const isClimate =
    (typeof format === 'string' &&
      format.includes('format-das-neue-klimaprojekt')) ||
    format?.repoId?.includes('format-das-neue-klimaprojekt')

  const isWdwww =
    (typeof format === 'string' &&
      format.includes('format-was-diese-woche-wichtig-war')) ||
    format?.repoId?.includes('format-was-diese-woche-wichtig-war')

  const { width, height } = isClimate
    ? { width: 157, height: 140 } // case of climate (= Challenge Accepted)
    : isWdwww
    ? { width: 220, height: 71 } // case of wdwww
    : { width: 178, height: 79 } // default

  const imageFile =
    (isClimate && 'logo_republik_newsletter_challenge_accepted.png') ||
    (isWdwww && 'logo_republik_newsletter_wdwww.png') ||
    'logo_republik_newsletter.png'

  const logoLink = (
    <a
      href={`https://www.republik.ch${path ? path : `/${slug}`}`}
      title='Im Web lesen'
    >
      <img
        width={width}
        height={height}
        src={`https://www.republik.ch/static/${imageFile}`}
        style={{
          border: 0,
          width: `${width}px !important`,
          height: `${height}px !important`,
          margin: 0,
          maxWidth: '100% !important',
        }}
        alt='REPUBLIK'
      />
    </a>
  )

  return (
    <>
      <tr>
        <td
          align={'center'}
          valign='top'
          style={{
            backgroundColor: isClimate ? '#EBEA2B' : null,
            borderBottom:
              formatLine && formatLine.color
                ? `3px solid ${formatLine.color}`
                : `1px solid ${colors.divider}`,
          }}
        >
          {logoLink}
        </td>
      </tr>
    </>
  )
}
