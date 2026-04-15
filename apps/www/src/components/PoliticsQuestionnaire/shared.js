import Link from 'next/link'

import { Editorial, NarrowContainer } from '@project-r/styleguide'

import { QUESTION_SEPARATOR } from './config'

import { QuestionSummaryChart } from '../Questionnaire/Submissions/components/QuestionChart'

export const QuestionLink = ({ questions, children }) => {
  const link = questions.map((q) => q.key).join(QUESTION_SEPARATOR)
  return (
    <Link href={`/politikfragebogen/frage/${link}`} passHref legacyBehavior>
      {children}
    </Link>
  )
}

export const SubmissionLink = ({ id, children }) => {
  return (
    <Link href={`/politikfragebogen/${id}`} passHref legacyBehavior>
      {children}
    </Link>
  )
}

export const AnswersChart = ({ question, skipTitle }) => {
  const options = question.value[0].options

  const validAnswers = question.value.filter((item) =>
    options.includes(item.answer),
  )

  const totalAnswers = validAnswers.length
  const values = options.map((option) => ({
    answer: option,
    value:
      (question.value.filter((result) => result.answer === option).length ??
        0) / totalAnswers,
  }))

  return (
    <NarrowContainer>
      <div style={{ marginTop: '46px' }}>
        {!skipTitle && (
          <Editorial.Subhead style={{ textAlign: 'center' }}>
            {question.value[0].question}
          </Editorial.Subhead>
        )}
        <div style={{ marginTop: 20 }}>
          <QuestionSummaryChart answers={values} key='answer' />
        </div>
      </div>
    </NarrowContainer>
  )
}
