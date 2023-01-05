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
      slug={'klima-postkarte'}
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
