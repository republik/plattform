import { useRouter } from 'next/router'
import { ColorContextProvider, Center } from '@project-r/styleguide'

import QuestionView from './views/QuestionView'
import AllQuestionsView from './views/AllQuestionsView'
import { getOrdinalColors } from './utils'

import { QuestionnaireConfig } from '../types/QuestionnaireConfig'
import SubmissionView from './views/SubmissionView'
import {
  FormLink,
  QUESTION_SEPARATOR,
  SUBMISSION_PREFIX,
} from './components/Links'

type SubmissionsOverviewProps = {
  CONFIG: QuestionnaireConfig
  extract?: boolean
  share?: {
    extract: number
  }
}

// decide whether to show:
// - all questions
// - a single question
// - a single person's answers
const Page = ({ CONFIG, extract, share }: SubmissionsOverviewProps) => {
  const router = useRouter()
  const { query } = router

  if (!CONFIG) return null

  // we avoid SSG for share urls
  // (see next.config l.129)
  let questionIds: string[] | undefined
  let submissionId: string | undefined
  if (
    typeof query.share === 'string' &&
    query.share.startsWith(SUBMISSION_PREFIX)
  ) {
    // assign share param to authorId
    submissionId = query.share.replace(SUBMISSION_PREFIX, '')
  } else if (typeof query.share === 'string') {
    // assign share param to questionIds
    questionIds = query.share.split(QUESTION_SEPARATOR)
  }

  const questionColor = getOrdinalColors(CONFIG.design.colors)

  return (
    <>
      <ColorContextProvider colorSchemeKey='light'>
        {questionIds ? (
          <QuestionView
            slug={CONFIG.dbSlug}
            extract={extract}
            questionIds={questionIds}
            questionColor={questionColor}
            questions={CONFIG.questionsStruct}
            questionnaireBgColor={CONFIG.design.bgColor}
            share={share}
            shareImg={CONFIG.design.shareImg}
          />
        ) : submissionId ? (
          <SubmissionView
            CONFIG={CONFIG}
            submissionId={submissionId}
            extract={extract}
            share={share}
            title={CONFIG.title}
          />
        ) : (
          <AllQuestionsView
            CONFIG={CONFIG}
            questionColor={questionColor}
            extract={extract}
          />
        )}
      </ColorContextProvider>
      {!extract && (
        <Center attributes={{ style: { marginBottom: -48, marginTop: 20 } }}>
          <FormLink
            slug={CONFIG.dbSlug}
            submissionId={submissionId}
            formPath={CONFIG.formPage}
          />
          <br />
        </Center>
      )}
    </>
  )
}

export default Page
