import Head from 'next/head'
import { useRouter } from 'next/router'

import {
  fontStyles,
  SHARE_IMAGE_WIDTH,
  SHARE_IMAGE_HEIGHT,
} from '@project-r/styleguide'
import { climateColors } from '../../Climatelab/config'

export const ShareImageSplit = ({ question, user, img }) => {
  const router = useRouter()
  const { query } = router
  if (!query.image && !query.extract) {
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
          display: 'grid',
          gridAutoColumns: '1fr',
          gridAutoFlow: 'column',
          backgroundColor: climateColors.light.default,
          color: climateColors.light.text,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={img} width={SHARE_IMAGE_WIDTH / 4} />
        </div>
        <div
          style={{
            ...fontStyles.serifRegular,
            fontSize: 48,
            lineHeight: 1.25,
            paddingRight: 60,
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
