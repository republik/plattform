import {
  plainButtonRule,
  Editorial,
  CommentHeaderProfile,
} from '@project-r/styleguide'
import { useState } from 'react'
import AnswerText from './AnswerText'
import PlainButton from './PlainButton'

const Submission = ({ t, displayAuthor, answers, questions }) => {
  const matchedIndexes = answers.nodes
    .map((answer, index) => (answer.hasMatched ? index : false))
    .filter((d) => d !== false)
  const [visibleIndexes, setVisible] = useState(
    matchedIndexes.length ? matchedIndexes : [0, 1],
  )
  const hiddenAnswersCount =
    visibleIndexes === true ? 0 : answers.nodes.length - visibleIndexes.length

  return (
    <>
      <CommentHeaderProfile
        t={t}
        displayAuthor={{
          name: displayAuthor.name,
          profilePicture: displayAuthor.profilePicture,
          credential: {
            description: `${answers.totalCount} Antworten`,
          },
        }}
      />
      {answers.nodes.map(({ id, question: { id: qid }, payload }, index) => {
        const question = questions.find((q) => q.id === qid)
        const isVisible =
          visibleIndexes === true || visibleIndexes.includes(index)
        const prevWasVisible =
          visibleIndexes === true || visibleIndexes.includes(index - 1)

        if (!isVisible) {
          if (prevWasVisible && index - 1 !== visibleIndexes.slice(-1)[0]) {
            return (
              <Editorial.P key={id}>
                <button
                  {...plainButtonRule}
                  onClick={() => {
                    setVisible(visibleIndexes.concat(index))
                  }}
                >
                  …
                </button>
              </Editorial.P>
            )
          }
          return null
        }

        return (
          <Editorial.P key={id}>
            <strong>{question.text}</strong>
            <br />
            <AnswerText
              text={payload.text}
              value={payload.value}
              question={question}
            />
          </Editorial.P>
        )
      })}
      {!!hiddenAnswersCount && (
        <PlainButton
          onClick={() => {
            setVisible(true)
          }}
        >
          {t.pluralize('questionnaire/submissions/showAnswers', {
            count: hiddenAnswersCount,
          })}
        </PlainButton>
      )}
    </>
  )
}

export default Submission
