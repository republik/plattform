import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import withT from '../../lib/withT'

import {
  Label,
  Loader
} from '@project-r/styleguide'

import {
  displayDateTime,
  Section,
  SectionTitle
} from '../Display/utils'

import List from '../MailLog/List'

const GET_USER_MAILLOG = gql`
query getUserMailLog($id: String) {
  user(slug: $id) {
    id
    mailLog {
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
      }
    }
  }
}
`

const MailLog = withT(({ userId }) => {
  return (
    <Query query={GET_USER_MAILLOG} variables={{id: userId}}>{({loading, error, data}) => {
      return (
        <Loader
          loading={loading}
          error={error}
          render={() =>
            <Section>
              <SectionTitle>
                E-Mails
              </SectionTitle>
              <List nodes={data.user.mailLog.nodes} />
            </Section>
          }
        />
      )
    }}</Query>
  )
})

export default MailLog
