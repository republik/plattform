import { useRouter } from 'next/router'

import { useQuery } from '@apollo/client'

import { Loader, ColorContextProvider, Center } from '@project-r/styleguide'

import { QUESTIONNAIRE_QUERY } from '../../Questionnaire/Submissions/graphql'
import {
  LinkToEditQuestionnaire,
  QuestionFeatured,
} from '../../Questionnaire/Submissions/QuestionFeatured'
import QuestionView from '../../Questionnaire/Submissions/QuestionView'

import { questionColor, QUESTIONS } from './config'

const AllQuestionsView = ({ slug, extract }) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_QUERY, {
    variables: { slug },
  })

  // the extract flag is only used for custom share for in the QuestionView
  if (extract) return null

  return (
    <>
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
                    slug={slug}
                    bgColor={questionColor(idx)}
                    valueLength={question.valueLength}
                  />
                )
              })}
            </div>
          )
        }}
      />
    </>
  )
}

const SubmissionsOverview = ({ slug, extract, share }) => {
  const router = useRouter()
  const { query } = router
  const questionIds = query.share ? [].concat(query.share) : undefined

  return (
    <ColorContextProvider colorSchemeKey='light'>
      {!extract && (
        <Center>
          <LinkToEditQuestionnaire slug={slug} />
        </Center>
      )}
      {questionIds ? (
        <QuestionView
          slug={slug}
          extract={extract}
          share={share}
          questionIds={questionIds}
        />
      ) : (
        <AllQuestionsView slug={slug} extract={extract} />
      )}
    </ColorContextProvider>
  )
}

export default SubmissionsOverview
