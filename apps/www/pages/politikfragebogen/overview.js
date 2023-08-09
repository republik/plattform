import { createGetServerSideProps } from '../../lib/apollo/helpers'
import SubmissionsOverview from '../../components/PoliticsQuestionnaire/Overview'
import { csvParse } from 'd3-dsv'
import { nest } from 'd3-collection'

import { QUESTION_TYPES } from '../../components/PoliticsQuestionnaire/config'

import { leftJoin } from '../../components/PoliticsQuestionnaire/utils'
import { PUBLIC_BASE_URL } from '../../lib/constants'

export default ({ submissionData }) => (
  <SubmissionsOverview submissionData={submissionData} />
)

export const getServerSideProps = createGetServerSideProps(
  async ({
    ctx: {
      query: { party },
    },
  }) => {
    const data = await fetch(
      PUBLIC_BASE_URL +
        '/static/politicsquestionnaire2023/submissions_data.csv',
    ).then((res) => res.text())

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

    return {
      props: {
        submissionData: groupedData,
      },
    }
  },
)
