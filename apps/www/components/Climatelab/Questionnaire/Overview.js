import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { Loader, Editorial } from '@project-r/styleguide'

import { QUESTIONNAIRE_QUERY } from '../../Questionnaire/Submissions/graphql'
import {
  QuestionFeatured,
  QuestionLink,
} from '../../Questionnaire/Submissions/QuestionFeatured'
import QuestionView from '../../Questionnaire/Submissions/QuestionView'

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
            <QuestionFeatured question={questions[0]} slug={slug} />
            <QuestionFeatured question={questions[1]} slug={slug} />
            <QuestionFeatured
              question={questions[2]}
              additionalQuestion={questions[3]}
              slug={slug}
            />
            <QuestionFeatured
              question={questions[2]}
              // additionalQuestion={questions[3]}
              slug={slug}
            />
            {/* <div style={{ marginTop: 60 }}>
              <Editorial.P>
                <Editorial.UL>
                  <Editorial.LI>
                    <QuestionLink
                      question={questions[2]}
                      additionalQuestion={questions[3]}
                    >
                      <Editorial.A>{questions[2].text}</Editorial.A>
                    </QuestionLink>{' '}
                    (psst: es gibt da noch eine Bonusfrage)
                  </Editorial.LI>
                  <Editorial.LI>
                    <QuestionLink question={questions[5]}>
                      <Editorial.A>{questions[5].text}</Editorial.A>
                    </QuestionLink>
                  </Editorial.LI>
                </Editorial.UL>
              </Editorial.P>
            </div> */}
            <QuestionFeatured
              question={questions[4]}
              additionalQuestion={questions[5]}
              slug={slug}
            />
            <QuestionFeatured question={questions[6]} slug={slug} />
            <QuestionFeatured question={questions[7]} slug={slug} />
            <QuestionFeatured question={questions[8]} slug={slug} />
            <QuestionFeatured question={questions[9]} slug={slug} />
            <QuestionFeatured question={questions[10]} slug={slug} />
            <QuestionFeatured
              question={questions[11]}
              additionalQuestion={questions[12]}
              slug={slug}
            />
            <QuestionFeatured
              question={questions[12]}
              additionalQuestion={questions[13]}
              slug={slug}
            />
            <QuestionFeatured question={questions[14]} slug={slug} />
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
