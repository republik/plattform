import { useRouter } from 'next/router'
import { ColorContextProvider, Center } from '@project-r/styleguide'

import QuestionView from './views/QuestionView'
import AllQuestionsView from './views/AllQuestionsView'
import { getOrdinalColors } from './utils'

import { QuestionnaireConfigType } from '../types/QuestionnaireConfig'
import SubmissionView from './views/SubmissionView'
import { FormLink, mapShareParam } from './components/Links'

type SubmissionsOverviewProps = {
  questionnaireConfig: QuestionnaireConfigType
  extract?: boolean
  share?: {
    extract: number
  }
}

// decide whether to show:
// - all questions
// - a single question
// - a single person's answers
const Page = ({
  questionnaireConfig,
  extract,
  share,
}: SubmissionsOverviewProps) => {
  const router = useRouter()
  const { query } = router

  if (!questionnaireConfig) return null

  const { questionIds, submissionId } = mapShareParam(query.share)
  const questionColor = getOrdinalColors(questionnaireConfig.design.colors)

  return (
    <>
      <ColorContextProvider colorSchemeKey='light'>
        {questionIds ? (
          <QuestionView
            slug={questionnaireConfig.dbSlug}
            extract={extract}
            questionIds={questionIds}
            questionColor={questionColor}
            questions={questionnaireConfig.questionsStruct}
            questionnaireBgColor={questionnaireConfig.design.bgColor}
            share={share}
            shareImg={questionnaireConfig.design.shareImg}
          />
        ) : submissionId ? (
          <SubmissionView
            questionnaireConfig={questionnaireConfig}
            submissionId={submissionId}
            extract={extract}
            share={share}
            title={questionnaireConfig.title}
          />
        ) : (
          <AllQuestionsView
            questionnaireConfig={questionnaireConfig}
            questionColor={questionColor}
            extract={extract}
          />
        )}
      </ColorContextProvider>
      {!extract && (
        <Center attributes={{ style: { marginBottom: -48, marginTop: 20 } }}>
          <FormLink
            slug={questionnaireConfig.dbSlug}
            submissionId={submissionId}
            formPath={questionnaireConfig.formPage}
          />
          <br />
        </Center>
      )}
    </>
  )
}

export default Page
