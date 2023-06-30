import { createGetServerSideProps } from '../../lib/apollo/helpers'
import SubmissionsOverview from '../../components/PoliticsQuestionnaire/Overview'
import fs from 'node:fs/promises'
import path from 'node:path'
import { csvParse, nest } from 'd3'

import {
  QUESTION_TYPES,
  leftJoin,
} from '../../../www/components/PoliticsQuestionnaire/config'

export default ({ submissionData }) => (
  <SubmissionsOverview submissionData={submissionData} />
)

export const getServerSideProps = createGetServerSideProps(async () => {
  const data = await fs.readFile(
    path.join(
      process.cwd(),
      'public/static/politicsquestionnaire2023/submissions_data.csv',
    ),
    'utf-8',
  )

  const responses = csvParse(data)

  const joinedData = leftJoin(responses, QUESTION_TYPES, 'questionSlug')
  const groupedData = nest()
    .key((d) => d.questionSlug)
    .entries(joinedData)

  return {
    props: {
      submissionData: groupedData,
    },
  }
})
