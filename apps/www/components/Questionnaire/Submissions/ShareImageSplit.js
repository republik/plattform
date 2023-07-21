import Head from 'next/head'
import { useRouter } from 'next/router'

import {
  fontStyles,
  SHARE_IMAGE_WIDTH,
  SHARE_IMAGE_HEIGHT,
} from '@project-r/styleguide'

export const ShareImageSplit = ({
  question,
  user,
  img,
  bgColor,
  personShareText,
}) => {
  const router = useRouter()
  const { query } = router
  if (!query.image && !query.extract) {
    return null
  }
  const text = question
    ? question.text
    : user
    ? personShareText + user?.name
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
          display: 'grid',
          gridAutoColumns: '1fr',
          gridAutoFlow: 'column',
          backgroundColor: bgColor,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={img} width={SHARE_IMAGE_WIDTH / 2} />
        </div>
        <div
          style={{
            ...fontStyles.serifTitle,
            fontSize: text.length < 80 ? 56 : 48,
            lineHeight: 1.3,
            paddingRight: text.length > 100 ? 100 : 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span>{text}</span>
        </div>
      </div>
    </>
  )
}
