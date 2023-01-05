import { QuestionnaireWithData } from '../../Questionnaire/Questionnaire'
import { PostcardPreview } from './PostcardPreview'

import { css } from 'glamor'

import { useTranslation } from '../../../lib/withT'

import {
  mediaQueries,
  fontStyles,
  convertStyleToRem,
  Button,
  Interaction,
} from '@project-r/styleguide'

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

// @TODO
const SubmittedPostcard = (props) => {
  const { questionnaire, onRevoke } = props
  const { t } = useTranslation()

  return (
    <div style={{ marginTop: '50px' }}>
      <PostcardPreview postcard={questionnaire} t={t} />

      {onRevoke && (
        <Button onClick={() => onRevoke()}>Nope, zurückziehen! Nochmal.</Button>
      )}

      <div style={{ marginTop: '20px' }}>
        <Interaction.P>
          {t('Climatelab/Postcard/PostcardPreview/merci1')}
        </Interaction.P>
        <br />
        <br />
        <Interaction.P>
          {t('Climatelab/Postcard/PostcardPreview/merci2')}
        </Interaction.P>
      </div>
    </div>
  )
}

const PostcardGenerator = () => (
  <div {...styles.questionnaireStyleOverride}>
    <QuestionnaireWithData
      slug={'klima-postkarte'}
      context='postcard'
      hideCount
      hideInvalid
      hideReset
      requireName={false}
      SubmittedComponent={SubmittedPostcard}
    />
  </div>
)

export default PostcardGenerator
