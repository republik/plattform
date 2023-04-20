import Head from 'next/head'
import { useRouter } from 'next/router'

import {
  fontStyles,
  SHARE_IMAGE_WIDTH,
  SHARE_IMAGE_HEIGHT,
} from '@project-r/styleguide'

import { useTranslation } from '../../../lib/withT'

import { QUESTIONNAIRE_BG_COLOR } from '../../Climatelab/Questionnaire/config'

export const ShareImageSplit = ({ question, user, img }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { query } = router
  if (!query.image && !query.extract) {
    return null
  }
  const text = question
    ? question.text
    : user
    ? t('Climatelab/Questionnaire/Person/title', {
        name: user?.name,
      })
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
          backgroundColor: QUESTIONNAIRE_BG_COLOR,
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
