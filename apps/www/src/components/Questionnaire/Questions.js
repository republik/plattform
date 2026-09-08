import compose from 'lodash/flowRight'
import { createElement } from 'react'
import ImageChoiceQuestion from '../Climatelab/Postcard/ImageChoiceQuestion'
import ChoiceQuestion from './ChoiceQuestion'
import { withAnswerMutation } from './enhancers'
import RangeQuestion from './RangeQuestion'

import TextQuestion from './TextQuestion'

const QUESTION_TYPES = {
  QuestionTypeDocument: () => null,
  QuestionTypeText: TextQuestion,
  QuestionTypeChoice: ChoiceQuestion,
  QuestionTypeRange: RangeQuestion,
  QuestionTypeImageChoice: ImageChoiceQuestion,
}

const Questions = compose(withAnswerMutation)(
  ({
    slug, // needed by enhancers
    questions,
    questionCount,
    submitAnswer,
    processSubmit,
    disabled,
  }) => {
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
            questionCount,
            key: q.id,
            disabled,
          }),
        )}
      </>
    )
  },
)

export default Questions
