import { createGetServerSideProps } from '../../../lib/apollo/helpers'
import Page from '../../../components/PoliticsQuestionnaire/SingleQuestionView'
import { csvParse } from 'd3-dsv'
import { nest } from 'd3-collection'
import {
  QUESTION_SEPARATOR,
  QUESTION_TYPES,
  QUESTIONS,
} from '../../../components/PoliticsQuestionnaire/config'

import {
  leftJoin,
  getTypeBySlug,
} from '../../../components/PoliticsQuestionnaire/utils'
import { PUBLIC_BASE_URL } from '../../../lib/constants'

export default ({
  chartAnswers,
  question,
  nestedResponses,
  questionTypes,
  questionIndex,
}) => (
  <Page
    chartAnswers={chartAnswers}
    question={question}
    nestedResponses={nestedResponses}
    questionTypes={questionTypes}
    questionIndex={questionIndex}
  />
)

export const getServerSideProps = createGetServerSideProps(
  async ({
    ctx: {
      params: { questionSlug },
    },
  }) => {
    const data = await fetch(
      PUBLIC_BASE_URL +
        '/static/politicsquestionnaire2023/submissions_data.csv',
    ).then((res) => res.text())

    const responses = csvParse(data).filter(
      (response) => response.answer !== 'NA',
    )

    const questionSlugs = questionSlug.split(QUESTION_SEPARATOR)

    const questionIndex = QUESTIONS.map((d) => d.questionSlugs[0]).indexOf(
      questionSlugs[0],
    )

    console.log(questionIndex)

    const responsesBySlug = responses.filter((d) =>
      questionSlugs.includes(d.questionSlug),
    )

    const questionTypes = questionSlugs.map((q) => getTypeBySlug(q))

    const nestedResponses = nest()
      .key((d) => d.uuid)
      .entries(responsesBySlug)

    const joinedData = leftJoin(responsesBySlug, QUESTION_TYPES, 'questionSlug')

    const chartAnswers = nest()
      .key((d) => d.questionSlug)
      .rollup((values) => values)
      .entries(joinedData)

    const question = responsesBySlug.map((d) => {
      return { question: d.question }
    })

    return {
      props: {
        chartAnswers: questionTypes.includes('choice') ? chartAnswers[0] : '',
        question: question[0].question,
        nestedResponses: nestedResponses,
        questionTypes: questionTypes,
        questionIndex: questionIndex,
      },
    }
  },
)
