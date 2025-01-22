import { useQuery } from '@apollo/client'
import { Loader } from '@project-r/styleguide'

import { QUESTIONNAIRE_QUERY } from '../graphql'
import { QaBlock } from '../components/QaBlock'

import { QuestionnaireConfigType } from '../../types/QuestionnaireConfig'

type AllQuestionsViewProps = {
  questionnaireConfig: QuestionnaireConfigType
  questionColor: (idx: number) => string
  extract?: boolean
}

const AllQuestionsView = ({
  questionnaireConfig,
  extract,
  questionColor,
}: AllQuestionsViewProps) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_QUERY, {
    variables: { slug: questionnaireConfig.dbSlug },
  })

  // the extract flag is only used for custom share for in the QuestionView and the PersonView
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
            {questionnaireConfig.questionsStruct.map((question, idx) => {
              const groupQuestions = question.ids.map((id) => questions[id])
              return (
                <QaBlock
                  key={question.ids.join('+')}
                  questions={groupQuestions}
                  hint={question.hint}
                  slug={questionnaireConfig.dbSlug}
                  bgColor={questionColor(idx)}
                  valueLength={question.valueLength}
                />
              )
            })}
          </div>
        )
      }}
    />
  )
}

export default AllQuestionsView
