import PersonPage from '../../components/PoliticsQuestionnaire/Person'
import { csvParse } from 'd3-dsv'

import { QUESTION_TYPES } from '../../components/PoliticsQuestionnaire/config'
import { leftJoin } from '../../components/PoliticsQuestionnaire/utils'
import { loadPoliticQuestionnaireCSV } from '../../components/PoliticsQuestionnaire/loader'

export default function Page({ responses, authorData }) {
  return <PersonPage responses={responses} authorData={authorData} />
}

export const getStaticProps = async ({ params: { id } }) => {
  const data = await loadPoliticQuestionnaireCSV()
  const responses = csvParse(data).filter(
    (response) => response.answer !== 'NA',
  )

  const responsesWithTypes = leftJoin(responses, QUESTION_TYPES, 'questionSlug')

  const responsesWithTypesById = responsesWithTypes.filter((d) => d.uuid === id)

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
}

export const getStaticPaths = async () => {
  const data = await loadPoliticQuestionnaireCSV()

  const responses = csvParse(data).filter(
    (response) => response.answer !== 'NA',
  )

  const responsesWithTypes = leftJoin(responses, QUESTION_TYPES, 'questionSlug')
  const ids = responsesWithTypes.map((d) => d.uuid)
  const paths = Array.from(...new Set(ids)).map((d) => {
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
}
