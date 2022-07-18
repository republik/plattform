import {
  plainButtonRule,
  Editorial,
  CommentHeaderProfile,
  Label,
} from '@project-r/styleguide'
import { useState } from 'react'
import { max } from 'd3-array'

import AnswerText from './AnswerText'
import PlainButton from './PlainButton'

const Submission = ({ t, displayAuthor, answers, questions }) => {
  const matchedIndexes = answers.nodes
    .map((answer, index) => (answer.hasMatched ? index : false))
    .filter((d) => d !== false)
  const [visibleIndexes, setVisible] = useState(
    matchedIndexes.length
      ? matchedIndexes
      : [0, 1].slice(0, answers.nodes.length), // handle 0 or 1 answer
  )
  const hiddenAnswersCount =
    visibleIndexes === true ? 0 : answers.nodes.length - visibleIndexes.length
  let lastShownIndex

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
      <div style={{ marginTop: 10 }}>
        {answers.nodes.map(({ id, question: { id: qid }, payload }, index) => {
          const question = questions.find((q) => q.id === qid)
          const isVisible =
            visibleIndexes === true || visibleIndexes.includes(index)

          if (!isVisible) {
            const prevWasVisible = lastShownIndex === index - 1
            const nextWillBeVisible = visibleIndexes.includes(index + 1)
            if (
              (prevWasVisible ||
                (nextWillBeVisible && lastShownIndex === undefined)) &&
              (matchedIndexes.length || index - 1 !== max(visibleIndexes))
            ) {
              return (
                <div
                  style={{
                    marginTop: prevWasVisible ? -20 : 10,
                    marginBottom: nextWillBeVisible ? -20 : 10,
                  }}
                  key={id}
                >
                  <Label>
                    <button
                      {...plainButtonRule}
                      onClick={() => {
                        setVisible(visibleIndexes.concat(index))
                      }}
                    >
                      […]
                    </button>
                  </Label>
                </div>
              )
            }
            return null
          }
          lastShownIndex = index
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
      </div>
    </>
  )
}

export default Submission
