import { createElement } from 'react'

import compose from 'lodash/flowRight'

import TextQuestion from './TextQuestion'
import ArticleQuestion from './ArticleQuestion'
import RangeQuestion from './RangeQuestion'
import ChoiceQuestion from './ChoiceQuestion'
import ImageChoiceQuestion from '../Climatelab/Postcard/ImageChoiceQuestion'
import { withAnswerMutation } from './enhancers'

const QUESTION_TYPES = {
  QuestionTypeDocument: ArticleQuestion,
  QuestionTypeText: TextQuestion,
  QuestionTypeChoice: ChoiceQuestion,
  QuestionTypeRange: RangeQuestion,
  QuestionTypeImageChoice: ImageChoiceQuestion,
}

const QuestionList = compose(withAnswerMutation)(
  ({ submitAnswer, processSubmit, questions, disabled }) => {
    const createHandleChange = (questionId) => (answerId, value) => {
      const payload = value !== null ? { value } : null
      processSubmit(submitAnswer, questionId, payload, answerId)
    }

    return (
      <>
        {questions.map((q) =>
          createElement(QUESTION_TYPES[q.__typename], {
            onChange: createHandleChange(q.id),
            question: q,
            key: q.id,
            disabled,
          }),
        )}
      </>
    )
  },
)

export default ({
  processSubmit,
  questions,
  disabled,
  sliceAt,
  showSlice2,
  slug,
}) => {
  const questions1 = sliceAt ? questions.slice(0, sliceAt) : questions
  const questions2 = sliceAt && questions.slice(sliceAt)

  return (
    <>
      <QuestionList
        questions={questions1}
        disabled={disabled}
        processSubmit={processSubmit}
        slug={slug}
      />
      {showSlice2 && (
        <>
          <QuestionList
            questions={questions2}
            disabled={disabled}
            processSubmit={processSubmit}
            slug={slug}
          />
        </>
      )}
    </>
  )
}
