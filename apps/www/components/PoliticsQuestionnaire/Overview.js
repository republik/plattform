import { css } from 'glamor'
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

import {
  AnswersGrid,
  AnswersGridCard,
} from '../Questionnaire/Submissions/AnswersGrid'

const SubmissionsOverview = ({ extract }) => {
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

  // the extract flag is only used for custom share for in the QuestionView
  if (extract) return null

  return submissionData.map((question) => (
    <AnswerGridOverview key={question.key} question={question} />
  ))
}

export default SubmissionsOverview

const AnswerGridOverview = ({ question }) => {
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
      <ColorContextProvider localColorVariables={colors} colorSchemeKey='light'>
        <AnswersGrid>
          {question.values.map(({ uuid, answers }) => (
            <AnswersGridCard key={uuid}>
              <div>
                <a style={{ textDecoration: 'none' }}>
                  <div {...styles.answerCard}>
                    <div>
                      <Editorial.Question style={{ marginTop: 0 }}>
                        {answers}
                      </Editorial.Question>
                      <Editorial.Credit
                        style={{
                          marginTop: '0',
                          paddingTop: '20px',
                        }}
                      >
                        Von{' '}
                        <span style={{ textDecoration: 'underline' }}>
                          {uuid}
                        </span>
                      </Editorial.Credit>
                    </div>
                  </div>
                </a>
              </div>
            </AnswersGridCard>
          ))}
        </AnswersGrid>
      </ColorContextProvider>
    </>
  )
}

const styles = {
  answerCard: css({
    background: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 24,
    color: 'black',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  }),
}
