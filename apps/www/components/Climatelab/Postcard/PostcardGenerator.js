import { QuestionnaireWithData } from '../../Questionnaire/Questionnaire'
import { PostcardPreview } from './PostcardPreview'

import { css } from 'glamor'

import { useTranslation } from '../../../lib/withT'

import {
  Interaction,
  mediaQueries,
  fontStyles,
  convertStyleToRem,
} from '@project-r/styleguide'

const styles = {
  questionnaireStyleOverride: css({
    '& div': {
      marginTop: '10px',
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

const PostcardGenerator = ({ postcard }) => {
  const { t } = useTranslation()
  return (
    <>
      <div {...styles.questionnaireStyleOverride}>
        <QuestionnaireWithData
          slug={'klima-postkarte'}
          context='postcard'
          publicSubmission={false}
          hideCount
          // submittedMessage={
          //   <Interaction.P>
          //     {t('Climatelab/Postcard/PostcardGenerator/merci1')}
          //   </Interaction.P>
          // }
          hideInvalid={true}
          hideReset={true}
        />
      </div>

      {postcard.userHasSubmitted && (
        <Interaction.P>
          {t('Climatelab/Postcard/PostcardGenerator/merci1')}
        </Interaction.P>
      )}
      <PostcardPreview postcard={postcard} t={t} />
    </>
  )
}

export default PostcardGenerator
