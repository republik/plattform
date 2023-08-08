import { createGetServerSideProps } from '../../lib/apollo/helpers'
import Page from '../../components/PoliticsQuestionnaire/Person'
import fs from 'node:fs/promises'
import path from 'node:path'
import { csvParse } from 'd3-dsv'

import { QUESTION_TYPES } from '../../components/PoliticsQuestionnaire/config'
import { leftJoin } from '../../components/PoliticsQuestionnaire/utils'

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
        'public/static/politicsquestionnaire2023/submissions_data.csv',
      ),
      'utf-8',
    )

    const responses = csvParse(data).filter(
      (response) => response.answer !== 'NA',
    )

    const responsesWithTypes = leftJoin(
      responses,
      QUESTION_TYPES,
      'questionSlug',
    )

    const responsesWithTypesById = responsesWithTypes.filter(
      (d) => d.uuid === id,
    )

    const questionAnswerPair = responsesWithTypesById.map((d) => {
      return {
        type: d.type,
        question: d.question,
        answer: d.answer,
        options: d.options || [],
      }
    })

    const authorData = responsesWithTypesById.map((d) => {
      return { id: d.uuid, name: d.name, party: d.party, canton: d.canton }
    })

    return {
      props: {
        responses: questionAnswerPair,
        authorData: authorData[0],
      },
    }
  },
)
