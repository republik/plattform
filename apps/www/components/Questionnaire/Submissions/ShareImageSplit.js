import Head from 'next/head'
import { useRouter } from 'next/router'

import { css } from 'glamor'

import {
  fontStyles,
  SHARE_IMAGE_WIDTH,
  SHARE_IMAGE_HEIGHT,
} from '@project-r/styleguide'

export const ShareImageSplit = ({ question, user, img }) => {
  const router = useRouter()
  const { query } = router
  if (!query.extract) {
    return null
  }
  const text = question
    ? question.text
    : user
    ? `${user.name} antwortet Klimafragen.`
    : undefined
  if (!text) return null

  return (
    <>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <div
        style={{
          width: SHARE_IMAGE_WIDTH,
          height: SHARE_IMAGE_HEIGHT,
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover',
          padding: '120px 180px',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          ...fontStyles.serifRegular,
          fontSize: 58,
          lineHeight: 1.25,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
          }}
          {...css({
            textOverflow: ['ellipsis', '" …»"'],
            '::before': {
              content: '«',
            },
            '::after': {
              content: '»',
            },
          })}
        >
          {text}
        </span>
      </div>
    </>
  )
}
