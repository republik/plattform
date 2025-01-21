import { useRouter } from 'next/router'

import { useQuery } from '@apollo/client'

import { Loader, ColorContextProvider, Center } from '@project-r/styleguide'

import { QUESTIONNAIRE_QUERY } from '../../Questionnaire/Submissions/graphql'
import {
  QUESTION_SEPARATOR,
  LinkToEditQuestionnaire,
  QuestionFeatured,
} from '../../Questionnaire/Submissions/components/QaBlock'
import QuestionView from '../../Questionnaire/Submissions/views/QuestionView'

import {
  questionColor,
  QUESTIONS,
  EDIT_QUESTIONNAIRE_PATH,
  PERSON_PAGE_PATH,
  QUESTIONNAIRE_BG_COLOR,
} from './config'

const AllQuestionsView = ({ slug, extract }) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_QUERY, {
    variables: { slug },
  })

  // the extract flag is only used for custom share for in the QuestionView
  if (extract) return null

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const {
          questionnaire: { questions },
        } = data

        return (
          <div style={{ margin: '48px auto 0' }}>
            {QUESTIONS.map((question, idx) => {
              const groupQuestions = question.ids.map((id) => questions[id])
              return (
                <QuestionFeatured
                  key={question.ids.join('+')}
                  questions={groupQuestions}
                  hint={question.hint}
                  slug={slug}
                  bgColor={questionColor(idx)}
                  valueLength={question.valueLength}
                  personPagePath={PERSON_PAGE_PATH}
                />
              )
            })}
          </div>
        )
      }}
    />
  )
}

const SubmissionsOverview = ({ slug, extract, share }) => {
  const router = useRouter()
  const { query } = router
  const questionIds = query.share?.split(QUESTION_SEPARATOR)

  return (
    <>
      <ColorContextProvider colorSchemeKey='light'>
        {questionIds ? (
          <QuestionView
            slug={slug}
            extract={extract}
            share={share}
            questionIds={questionIds}
            questionColor={questionColor}
            questions={QUESTIONS}
            personPagePath={PERSON_PAGE_PATH}
            questionnaireBgColor={QUESTIONNAIRE_BG_COLOR}
          />
        ) : (
          <AllQuestionsView slug={slug} extract={extract} />
        )}
      </ColorContextProvider>
      {!extract && (
        <Center attributes={{ style: { marginBottom: -48, marginTop: 20 } }}>
          <LinkToEditQuestionnaire
            slug={slug}
            questionnairePath={EDIT_QUESTIONNAIRE_PATH}
            personPagePath={PERSON_PAGE_PATH}
          />
          <br />
        </Center>
      )}
    </>
  )
}

export default SubmissionsOverview
