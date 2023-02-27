import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { Loader, ColorContextProvider } from '@project-r/styleguide'
import { QUESTIONNAIRE_QUERY } from '../../Questionnaire/Submissions/graphql'
import { QuestionFeatured } from '../../Questionnaire/Submissions/QuestionFeatured'
import QuestionView from '../../Questionnaire/Submissions/QuestionView'
import { questionColor, QUESTIONS } from './config'

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
          <div style={{ margin: '0 auto' }}>
            {/* FIXME: i know this looks really bad, but once we have the real questions in, we should take a look again. 
            The idea (my idea, maybe a bad one) was to display to charts at the beginning */}
            <div style={{ display: 'flex', gap: '1rem' }}></div>
            {QUESTIONS.map((question, i) => {
              const groupQuestions = question.ids.map((id) => questions[id])
              return (
                <QuestionFeatured
                  key={question.ids.join('+')}
                  questions={groupQuestions}
                  slug={slug}
                  bgColor={questionColor(groupQuestions[0].id)}
                  valueLength={question.valueLength}
                />
              )
            })}
            [CTA FRAGEBOGEN AUSFÜLLEN] [SHARE-KOMPONENTE]
          </div>
        )
      }}
    />
  )
}

const SubmissionsOverview = ({ slug, extract, share }) => {
  const router = useRouter()
  const { query } = router
  const questionIds = query.share ? [].concat(query.share) : undefined

  return (
    <ColorContextProvider colorSchemeKey='light'>
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
