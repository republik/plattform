import { createGetServerSideProps } from '../../lib/apollo/helpers'
import SubmissionsOverview from '../../components/PoliticsQuestionnaire/Overview'
import fs from 'node:fs/promises'
import path from 'node:path'
import { csvParse } from 'd3-dsv'
import { nest } from 'd3-collection'

import { QUESTION_TYPES } from '../../../www/components/PoliticsQuestionnaire/config'

import { leftJoin } from '../../../www/components/PoliticsQuestionnaire/utils'
import { filter } from 'lodash'

export default ({ submissionData }) => (
  <SubmissionsOverview submissionData={submissionData} />
)

export const getServerSideProps = createGetServerSideProps(
  async ({
    ctx: {
      query: { party },
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

    const joinedData = leftJoin(responses, QUESTION_TYPES, 'questionSlug')

    const filterByLength = joinedData.filter((item) => {
      return (
        item.answer.length > item.answerLength?.min &&
        item.answer.length < item.answerLength?.max
      )
    })

    const filteredByParty = party
      ? joinedData.filter((response) => response.party === party)
      : filterByLength

    const groupedData = nest()
      .key((d) => d.questionSlug)
      .rollup((values) => (party ? values : values.slice(0, 6)))
      .entries(filteredByParty)

    return {
      props: {
        submissionData: groupedData,
      },
    }
  },
)
