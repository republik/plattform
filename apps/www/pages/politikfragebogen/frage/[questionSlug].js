import { createGetServerSideProps } from '../../../lib/apollo/helpers'
import Page from '../../../components/PoliticsQuestionnaire/SingleQuestionView'
import fs from 'node:fs/promises'
import path from 'node:path'
import { csvParse } from 'd3'

export default ({ answers, question }) => (
  <Page answers={answers} question={question} />
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
        'public/static/politicsquestionnaire2023/submissions_dummy_data.csv',
      ),
      'utf-8',
    )
    const responses = csvParse(data)

    const responsesBySlug = responses.filter(
      (d) => d.questionSlug === questionSlug,
    )

    const answers = responsesBySlug.map((d) => {
      return { answer: d.answer, name: d.name, uuid: d.uuid }
    })

    const question = responsesBySlug.map((d) => {
      return { question: d.question }
    })

    return {
      props: {
        answers: answers,
        question: question[0],
      },
    }
  },
)
