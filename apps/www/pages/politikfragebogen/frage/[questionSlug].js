import { createGetServerSideProps } from '../../../lib/apollo/helpers'
import Page from '../../../components/PoliticsQuestionnaire/SingleQuestionView'
import fs from 'node:fs/promises'
import path from 'node:path'
import { csvParse, nest } from 'd3'
import { QUESTION_SEPARATOR } from '../../../components/PoliticsQuestionnaire/config'

export default ({ answers, question, nestedResponses }) => (
  <Page
    answers={answers}
    question={question}
    nestedResponses={nestedResponses}
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
    const responses = csvParse(data)

    const questionSlugs = questionSlug.split(QUESTION_SEPARATOR)

    const responsesBySlug = responses.filter((d) =>
      questionSlugs.includes(d.questionSlug),
    )

    const nestedResponses = nest()
      .key((d) => d.questionSlug)
      .entries(responsesBySlug)

    // console.log(nestedResponses)

    const answers = responsesBySlug.map((d) => {
      return { answer: d.answer, name: d.name, uuid: d.uuid }
    })

    const question = responsesBySlug.map((d) => {
      return { question: d.question }
    })

    return {
      props: {
        answers: answers,
        question: question,
        nestedResponses: nestedResponses,
      },
    }
  },
)
