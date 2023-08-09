import { createGetStaticProps } from '../../../lib/apollo/helpers'
import SingleQuestionView from '../../../components/PoliticsQuestionnaire/SingleQuestionView'
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
import { loadPoliticQuestionnaireCSV } from '../../../components/PoliticsQuestionnaire/loader'

export default function Page({
  chartAnswers,
  question,
  nestedResponses,
  questionTypes,
  questionIndex,
}) {
  return (
    <SingleQuestionView
      chartAnswers={chartAnswers}
      question={question}
      nestedResponses={nestedResponses}
      questionTypes={questionTypes}
      questionIndex={questionIndex}
    />
  )
}

export const getStaticProps = createGetStaticProps(
  async (_, { params: { questionSlug } }) => {
    const data = await loadPoliticQuestionnaireCSV()

    const responses = csvParse(data).filter(
      (response) => response.answer !== 'NA',
    )

    const questionSlugs = questionSlug.split(QUESTION_SEPARATOR)

    const questionIndex = QUESTIONS.map((d) => d.questionSlugs[0]).indexOf(
      questionSlugs[0],
    )

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

export const getStaticPaths = async () => {
  const paths = QUESTIONS.filter((d) => {
    if (d.questionSlugs.length === 1) {
      const questionType = QUESTION_TYPES.find(
        (q) => q.questionSlug === d.questionSlugs[0],
      )
      return questionType?.type !== 'choice'
    }
    return true
  }).map((d) => ({
    params: {
      questionSlug: d.questionSlugs.join(QUESTION_SEPARATOR),
    },
  }))

  return {
    paths,
    fallback: false,
  }
}
