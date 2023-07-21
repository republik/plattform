import { createGetServerSideProps } from '../../../lib/apollo/helpers'
import Page from '../../../components/PoliticsQuestionnaire/SingleQuestionView'
import fs from 'node:fs/promises'
import path from 'node:path'
import { csvParse } from 'd3-dsv'
import { nest } from 'd3-collection'
import {
  QUESTION_SEPARATOR,
  QUESTION_TYPES,
} from '../../../components/PoliticsQuestionnaire/config'
import { getTypeBySlug } from '../../../components/PoliticsQuestionnaire/Overview'

import { leftJoin } from '../../../../www/components/PoliticsQuestionnaire/utils'

export default ({ chartAnswers, question, nestedResponses, questionTypes }) => (
  <Page
    chartAnswers={chartAnswers}
    question={question}
    nestedResponses={nestedResponses}
    questionTypes={questionTypes}
  />
)

export const getServerSideProps = createGetServerSideProps(
  async ({
    ctx: {
      params: { questionSlug },
    },
  }) => {
    const data = await fs.readFile(
      path.join(
        process.cwd(),
        'public/static/politicsquestionnaire2023/submissions_data.csv',
      ),
      'utf-8',
    )
    const responses = csvParse(data).filter(
      (response) => response.answer !== 'NA',
    )

    const questionSlugs = questionSlug.split(QUESTION_SEPARATOR)

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
        question: question,
        nestedResponses: nestedResponses,
        questionTypes: questionTypes,
      },
    }
  },
)
