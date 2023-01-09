import { useRef, useEffect } from 'react'

import { QuestionnaireWithData } from '../../Questionnaire/Questionnaire'
import { PostcardPreview } from './PostcardPreview'

import { css } from 'glamor'

import { useTranslation } from '../../../lib/withT'

import scrollIntoView from 'scroll-into-view'

import {
  mediaQueries,
  fontStyles,
  convertStyleToRem,
  Button,
  Interaction,
} from '@project-r/styleguide'
import { CLIMATE_POSTCARD_QUESTIONNAIRE_ID } from '../constants'

const styles = {
  questionnaireStyleOverride: css({
    marginTop: '-25px',
    '& h2': {
      ...convertStyleToRem(fontStyles.sansSerifRegular17),
    },
    '& textarea': {
      ...convertStyleToRem(fontStyles.sansSerifRegular17),
    },
    [mediaQueries.mUp]: {
      '& h2': {
        ...convertStyleToRem(fontStyles.sansSerifRegular21),
      },
      '& textarea': {
        ...convertStyleToRem(fontStyles.sansSerifRegular21),
      },
    },
  }),
}

const SubmittedPostcard = (props) => {
  const { questionnaire, onRevoke } = props
  const { t } = useTranslation()
  const postcardRef = useRef()

  useEffect(() => {
    scrollIntoView(postcardRef.current)
  }, [])

  console.log(questionnaire)

  const { questions, userHasSubmitted } = questionnaire

  const imageOptions = questions && questions[0].options
  const imageSelection =
    questions[0].userAnswer && questions[0].userAnswer.payload.value[0]

  const postcardText =
    questions[1].userAnswer && questions[1].userAnswer.payload.value

  const imageUrl =
    imageOptions &&
    imageOptions.filter((d) => d.value === imageSelection)[0]?.imageUrl

  const postcard = {
    text: postcardText,
    imageUrl: imageUrl,
    imageSelection: imageSelection,
  }

  return (
    <div style={{ marginTop: '50px' }} ref={postcardRef}>
      {!(userHasSubmitted && !imageSelection && !postcardText) && (
        <PostcardPreview postcard={postcard} t={t} />
      )}

      {onRevoke && (
        <Button onClick={() => onRevoke()}>
          {t('questionnaire/postcard/revoke')}
        </Button>
      )}

      <div style={{ margin: '20px 0' }}>
        <Interaction.P>
          {t('Climatelab/Postcard/PostcardPreview/merci1')}
        </Interaction.P>
      </div>
    </div>
  )
}

const PostcardGenerator = () => (
  <div {...styles.questionnaireStyleOverride}>
    <QuestionnaireWithData
      slug={CLIMATE_POSTCARD_QUESTIONNAIRE_ID}
      context='postcard'
      hideCount
      hideInvalid
      hideReset
      requireName={false}
      SubmittedComponent={SubmittedPostcard}
      showAnonymize
    />
  </div>
)

export default PostcardGenerator
