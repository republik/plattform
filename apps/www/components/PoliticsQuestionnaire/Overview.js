import { csv, nest } from 'd3'
import { useEffect, useState } from 'react'
import { PUBLIC_BASE_URL } from '../../lib/constants'

import {
  ColorContextProvider,
  colors,
  Editorial,
  inQuotes,
  Interaction,
  NarrowContainer,
} from '@project-r/styleguide'

const SubmissionsOverview = () => {
  const [politicsMetaData, setPoliticsMetaData] = useState([])
  const [submissionData, setSubmissionData] = useState([])
  useEffect(() => {
    csv(
      `${PUBLIC_BASE_URL}/static/politicsquestionnaire2023/politics_dummy_data.csv`,
    ).then((data) => setPoliticsMetaData(data))
    csv(
      `${PUBLIC_BASE_URL}/static/politicsquestionnaire2023/submissions_dummy_data.csv`,
    ).then((data) => {
      const groupedData = nest()
        .key((d) => d.questions)
        .entries(data)

      return setSubmissionData(groupedData)
    })
  }, [])
  console.log({ politicsMetaData })
  console.log({ submissionData })
  return submissionData.map((question) => (
    <AnswerGridOverview key={question.key} question={question} />
  ))
}

export default SubmissionsOverview

const AnswerGridOverview = ({ question }) => {
  console.log(question)
  return (
    <>
      <NarrowContainer>
        <Editorial.Subhead style={{ textAlign: 'center' }}>
          {question.key}
        </Editorial.Subhead>
        {/* {hint && (
          <Interaction.P style={{ textAlign: 'center', fontSize: '1em' }}>
            {hint}
          </Interaction.P>
        )} */}
      </NarrowContainer>
      {/* <ColorContextProvider localColorVariables={colors} colorSchemeKey='light'>
        <AnswersGrid>
          {targetedAnswers.map(({ answers, displayAuthor, id }) => (
            <AnswersGridCard
              key={id}
              textLength={answers[0].payload.value.length}
            >
              <SubmissionLink id={id}>
                <a style={{ textDecoration: 'none' }}>
                  <div {...styles.answerCard}>
                    <div>
                      <Editorial.Question style={{ marginTop: 0 }}>
                        {inQuotes(answers[0].payload.value)}
                      </Editorial.Question>
                      <Editorial.Credit
                        style={{
                          marginTop: '0',
                          paddingTop: '20px',
                        }}
                      >
                        Von{' '}
                        <span style={{ textDecoration: 'underline' }}>
                          {displayAuthor.name}
                        </span>
                      </Editorial.Credit>
                    </div>
                  </div>
                </a>
              </SubmissionLink>
            </AnswersGridCard>
          ))}
        </AnswersGrid>
      </ColorContextProvider> */}
    </>
  )
}
