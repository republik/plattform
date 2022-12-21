import { QuestionnaireWithData } from '../Questionnaire/Questionnaire'
import { PostcardPreview } from './PostcardPreview'

import { Interaction } from '@project-r/styleguide'

export const PostcardGenerator = ({ t }) => {
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
}
