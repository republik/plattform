import { QuestionnaireWithData } from '../../Questionnaire/Questionnaire'
import { PostcardPreview } from './PostcardPreview'

import { css } from 'glamor'

import { useTranslation } from '../../../lib/withT'

import {
  mediaQueries,
  fontStyles,
  convertStyleToRem,
  Button,
} from '@project-r/styleguide'

const styles = {
  questionnaireStyleOverride: css({
    '& div': {
      marginTop: '20px',
    },
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
const TestComponent = (props) => {
  const { questionnaire, onResubmit } = props
  const { t } = useTranslation()

  return (
    <>
      <PostcardPreview postcard={questionnaire} t={t} />
      {onResubmit && <Button onClick={() => onResubmit()}>bearbeiten</Button>}
    </>
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
      SubmittedComponent={TestComponent}
    />
  </div>
)

export default PostcardGenerator
