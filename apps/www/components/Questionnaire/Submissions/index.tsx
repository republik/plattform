import { useRouter } from 'next/router'
import scrollIntoView from 'scroll-into-view'

import {
  ColorContextProvider,
  Center,
  useHeaderHeight,
} from '@project-r/styleguide'

import QuestionView from './views/QuestionView'
import AllQuestionsView from './views/AllQuestionsView'
import { getOrdinalColors } from './utils'

import { QuestionnaireConfigType } from '../types/QuestionnaireConfig'
import SubmissionView from './views/SubmissionView'
import {
  FormLink,
  MAIN_VIEWPORT_FOCUS,
  mapShareParam,
} from './components/Links'
import { useEffect, useRef } from 'react'

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
  const [headerHeight] = useHeaderHeight()
  const router = useRouter()
  const { query } = router
  const { questionIds, submissionId } = mapShareParam(query.share)
  const questionColor = getOrdinalColors(questionnaireConfig.design.colors)

  const answersRef = useRef()
  useEffect(() => {
    if (extract) return
    if (query?.focus === MAIN_VIEWPORT_FOCUS) {
      scrollIntoView(answersRef.current, {
        time: 0,
        align: { topOffset: headerHeight, top: 0 },
      })
    }
  }, [])

  return (
    <div ref={answersRef}>
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
    </div>
  )
}

export default Page
