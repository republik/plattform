import React, { useMemo } from 'react'
import colors from '../../styleguide-clone/theme/colors'
import { getFormatLine } from '../../styleguide-clone/components/TeaserFeed/utils'
import { matchProjectR } from '../util/project-r'

const {
  ASSETS_SERVER_BASE_URL,
  AWS_S3_BUCKET, // ./s3 warns if missing
} = process.env

const LOGO_BASE_URL = `${ASSETS_SERVER_BASE_URL}/s3/${AWS_S3_BUCKET}`

const HEADER_VARIANTS = [
  // Challenge Accepted
  {
    repoId: 'republik/format-das-neue-klimaprojekt',
    width: 157,
    height: 140,
    imageSrc: '/logos/logo_republik_newsletter_challenge_accepted.png?v=2',
    backgroundColor: '#EBEA2B',
  },
  {
    repoId: 'republik/format-was-diese-woche-wichtig-war',
    width: 220,
    height: 71,
    imageSrc: '/logos/logo_republik_newsletter_wdwww.png',
  },
  {
    repoId: 'republik/format-briefing-aus-bern',
    width: 220,
    height: 71,
    imageSrc: '/logos/logo_republik_newsletter_bab.png',
  },
  {
    repoId: 'republik/format-ctrl',
    width: 220,
    height: 71,
    imageSrc: '/logos/logo_republik_newsletter_ctrl.gif',
  },
]

const HEADER_VARIANT_DEFAULT = {
  width: 178,
  height: 79,
  imageSrc: '/logos/logo_republik_newsletter.png',
}

const Header = ({ meta }) => {
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

  if (isProjectR) {
    return null
  }

  const formatRepoId = typeof format === 'string' ? format : format?.repoId

  const { width, height, backgroundColor, imageSrc } =
    HEADER_VARIANTS.find(({ repoId }) => {
      return formatRepoId?.includes(repoId)
    }) ?? HEADER_VARIANT_DEFAULT

  const logoLink = (
    <a
      href={`https://www.republik.ch${path ? path : `/${slug}`}`}
      title='Im Web lesen'
    >
      <img
        width={width}
        height={height}
        src={`${LOGO_BASE_URL}${imageSrc}`}
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
            backgroundColor,
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

export default Header
