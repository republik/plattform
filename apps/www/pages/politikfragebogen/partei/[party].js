import { csvParse } from 'd3-dsv'
import { nest } from 'd3-collection'
import { leftJoin } from '../../../components/PoliticsQuestionnaire/utils'
import { QUESTION_TYPES } from '../../../components/PoliticsQuestionnaire/config'
import SubmissionsOverview from '../../../components/PoliticsQuestionnaire/Overview'
import { loadPoliticQuestionnaireCSV } from '../../../components/PoliticsQuestionnaire/loader'

export default function Page({ submissionData, party, availableParties }) {
  console.log('submissionData', submissionData)
  console.log('party', party)
  console.log('availableParties', availableParties)
  return (
    <SubmissionsOverview
      party={party}
      submissionData={submissionData}
      availableParties={availableParties}
    />
  )
}

export const getStaticProps = async ({ params: { party } }) => {
  const data = await loadPoliticQuestionnaireCSV()
  console.log('data', data)
  const responses = csvParse(data).filter(
    (response) => response.answer !== 'NA',
  )

  const joinedData = leftJoin(responses, QUESTION_TYPES, 'questionSlug')

  const filterByLength = joinedData
    .filter((item) => {
      if (item.type === 'choice') return item
      return (
        item.answer.length > item.answerLength?.min &&
        item.answer.length < item.answerLength?.max
      )
    })
    .sort(() => Math.random() - 0.5)

  const filteredByParty = party
    ? joinedData.filter(
        (response) => response.party === decodeURIComponent(party),
      )
    : filterByLength

  const groupedData = nest()
    .key((d) => d.questionSlug)
    .rollup((values) =>
      values[0].type === 'choice' || party ? values : values.slice(0, 6),
    )
    .entries(filteredByParty)

  const availableParties = [
    ...new Set(responses.map((response) => response.party)),
  ].map((party) => encodeURIComponent(party))

  return {
    props: {
      submissionData: groupedData,
      party,
      availableParties,
    },
  }
}

export const getStaticPaths = async () => {
  const data = await loadPoliticQuestionnaireCSV()
  console.log('data', data)
  const responses = csvParse(data).filter(
    (response) => response.answer !== 'NA',
  )

  const paths = [...new Set(responses.map((response) => response.party))].map(
    (party) => ({ params: { party: encodeURIComponent(party) } }),
  )

  return {
    paths,
    fallback: false,
  }
}
