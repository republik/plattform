import { QuestionnaireWithData } from '../../Questionnaire/Questionnaire'
import { PostcardPreview } from './PostcardPreview'

import { css } from 'glamor'

import withT from '../../../lib/withT'

import {
  Interaction,
  Loader,
  mediaQueries,
  fontStyles,
  convertStyleToRem,
} from '@project-r/styleguide'

const styles = {
  questionnaireStyleOverride: css({
    '& h2': {
      ...convertStyleToRem(fontStyles.sansSerifRegular19),
    },
    [mediaQueries.mUp]: {
      '& h2': {
        ...convertStyleToRem(fontStyles.sansSerifRegular22),
      },
    },
  }),
}

const PostcardGenerator = ({ t, data }) => {
  return (
    <Loader
      loading={data?.loading}
      error={data?.error}
      render={() => {
        return (
          <>
            <div {...styles.questionnaireStyleOverride}>
              <QuestionnaireWithData
                slug={'klima-postkarte'}
                publicSubmission={false}
                hideCount
                submittedMessage={
                  <Interaction.P>
                    {t('Climatelab/Postcard/PostcardGenerator/merci1')}
                  </Interaction.P>
                }
                hideInvalid={true}
                hideReset={true}
              />
            </div>
            <PostcardPreview t={t} />
          </>
        )
      }}
    />
  )
}

export default withT(PostcardGenerator)
