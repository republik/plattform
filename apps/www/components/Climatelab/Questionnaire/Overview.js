import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { Loader, Editorial } from '@project-r/styleguide'
import { QUESTIONNAIRE_QUERY } from '../../Questionnaire/Submissions/graphql'
import {
  QuestionFeatured,
  QuestionLink,
} from '../../Questionnaire/Submissions/QuestionFeatured'
import QuestionView from '../../Questionnaire/Submissions/QuestionView'
import { questionColor, QUESTION_IDS } from './config'

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
            {QUESTION_IDS.map((ids, i) => {
              const groupQuestions = ids.map((id) => questions[id])
              return (
                <QuestionFeatured
                  key={ids.join('+')}
                  questions={groupQuestions}
                  slug={slug}
                  bgColor={questionColor(groupQuestions[0].id)}
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

  if (questionIds) {
    return (
      <QuestionView
        slug={slug}
        extract={extract}
        share={share}
        questionIds={questionIds}
      />
    )
  }
  return <AllQuestionsView slug={slug} extract={extract} />
}

export default SubmissionsOverview
