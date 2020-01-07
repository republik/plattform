import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import withT from '../../lib/withT'

import {
  Label,
  Loader,
  A
} from '@project-r/styleguide'

import {
  displayDateTime,
  Section,
  SectionTitle
} from '../Display/utils'

import { tableStyles } from '../Tables/utils'
import routes from '../../server/routes'
import List from './List'

const { Link } = routes

const GET_MAILLOG = gql`
query getMailLog {
  mailLog(first: 100) {
    nodes {
      id
      email
      type
      template
      subject
      createdAt
      status
      error
      mandrill {
        label
        url
      }
      user {
        id
        name
      }
    }
  }
}
`

const Page = withT(({ userId }) => {
  return (
    <Query query={GET_MAILLOG} variables={{id: userId}}>{({loading, error, data}) => {
      return (
        <Loader
          loading={loading}
          error={error}
          render={() =>
            <Section>
              <SectionTitle>
                E-Mails
              </SectionTitle>
              <List nodes={data.mailLog.nodes} />
            </Section>
          }
        />
      )
    }}</Query>
  )
})

export default Page