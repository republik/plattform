import { createGetServerSideProps } from '../../lib/apollo/helpers'
import Page from '../../components/PoliticsQuestionnaire/Person'
import fs from 'node:fs/promises'
import path from 'node:path'
import { csvParse } from 'd3'

export default ({ responses, authorData }) => (
  <Page responses={responses} authorData={authorData} />
)

export const getServerSideProps = createGetServerSideProps(
  async ({
    ctx: {
      params: { id },
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

    const responsesById = responses.filter((d) => d.uuid === id)

    const questionAnswerPair = responsesById.map((d) => {
      return { question: d.question, answer: d.answer }
    })

    const authorData = responsesById.map((d) => {
      return { id: d.uuid, name: d.name }
    })

    return {
      props: {
        responses: questionAnswerPair,
        authorData: authorData[0],
      },
    }
  },
)
