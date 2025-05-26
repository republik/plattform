import Frame from '../components/Frame'
import Page from '../components/Impressum/Page'
import { createGetStaticProps } from '../lib/apollo/helpers'
import { getCMSClientBase } from '@app/lib/apollo/cms-client-base'
import {
  EmployeesDocument,
  EmployeeRecord,
} from '#graphql/cms/__generated__/gql/graphql'

const EMPLOYEES_PAGE_SSG_REVALIDATE = 60 // revalidate every minute

type ImpressumPageProps = {
  data: EmployeeRecord[]
  draftMode: boolean
}

const ImpressumPage = ({ data, draftMode }: ImpressumPageProps) => {
  const meta = {
    title: 'Impressum',
    description: 'Die Köpfe hinter der Republik.',
  }
  return (
    <Frame meta={meta} draftMode={draftMode} containerMaxWidth='1140px'>
      <Page data={data} />
    </Frame>
  )
}

export default ImpressumPage

export const getStaticProps = createGetStaticProps(
  async (client, { draftMode }) => {
    const datoCMSData = await getCMSClientBase({ draftMode }).query({
      query: EmployeesDocument,
    })
    return {
      props: {
        data: [...datoCMSData.data.employees],
        draftMode: draftMode ?? false,
      },
      revalidate: EMPLOYEES_PAGE_SSG_REVALIDATE,
    }
  },
)
