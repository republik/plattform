import { QuestionnaireWithData } from '../Questionnaire/Questionnaire'
import { PostcardPreview } from './PostcardPreview'

import { Interaction, Loader } from '@project-r/styleguide'
import withT from '../../lib/withT'

const PostcardGenerator = ({ t, data }) => {
  return (
    <Loader
      loading={data?.loading}
      error={data?.error}
      render={() => {
        return (
          <>
            <QuestionnaireWithData
              slug={'klima-postkarte'}
              publicSubmission={false}
              hideCount
              submittedMessage={
                <Interaction.P>
                  {t('Onboarding/Sections/Postcard/merci1')}
                </Interaction.P>
              }
              hideInvalid={true}
              hideReset={true}
            />
            <PostcardPreview t={t} />
          </>
        )
      }}
    />
  )
}

export default withT(PostcardGenerator)
