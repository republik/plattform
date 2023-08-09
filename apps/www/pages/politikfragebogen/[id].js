import {
  createGetServerSideProps,
  createGetStaticPaths,
  createGetStaticProps,
} from '../../lib/apollo/helpers'
import Page from '../../components/PoliticsQuestionnaire/Person'
import { csvParse } from 'd3-dsv'
import fs from 'node:fs/promises'
import path from 'node:path'

import { QUESTION_TYPES } from '../../components/PoliticsQuestionnaire/config'
import { leftJoin } from '../../components/PoliticsQuestionnaire/utils'

export default ({ responses, authorData }) => (
  <Page responses={responses} authorData={authorData} />
)

async function fetchData() {
  return fs.readFile(
    path.join(
      process.cwd(),
      'public/static/politicsquestionnaire2023/submissions_data.csv',
    ),
    'utf-8',
  )
}

export const getStaticProps = createGetStaticProps(
  async (_, { params: { id } }) => {
    const data = await fetchData()
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

export const getStaticPaths = createGetStaticPaths(async () => {
  const data = await fetchData()

  const responses = csvParse(data).filter(
    (response) => response.answer !== 'NA',
  )

  const responsesWithTypes = leftJoin(responses, QUESTION_TYPES, 'questionSlug')
  const ids = responsesWithTypes.map((d) => d.uuid)
  const paths = ids
    .filter((d, idx) => ids.indexOf(d) == idx)
    .map((d) => {
      return {
        params: {
          id: d,
        },
      }
    })

  return {
    paths,
    fallback: false,
  }
})
