import { createGetStaticProps } from '../../lib/apollo/helpers'
import SubmissionsOverview from '../../components/PoliticsQuestionnaire/Overview'
import { csvParse } from 'd3-dsv'
import { nest } from 'd3-collection'

import { QUESTION_TYPES } from '../../components/PoliticsQuestionnaire/config'

import { leftJoin } from '../../components/PoliticsQuestionnaire/utils'
import { loadPoliticQuestionnaireCSV } from '../../components/PoliticsQuestionnaire/loader'

export default function Page({ submissionData, availableParties }) {
  return (
    <SubmissionsOverview
      submissionData={submissionData}
      availableParties={availableParties}
    />
  )
}

export const getStaticProps = createGetStaticProps(
  async (_, { params: { party } = {} }) => {
    const data = await loadPoliticQuestionnaireCSV()

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
      ? joinedData.filter((response) => response.party === party)
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
        availableParties,
      },
    }
  },
)
