import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  Section,
  SectionTitle,
  displayDate,
  SectionSubhead,
  DT,
  DD,
} from '../../Display/utils'
import { Loader } from '@project-r/styleguide'
import List, { Item } from '../../List'

const GET_SUSPENSIONS = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      isSuspended
      suspendedUntil
      suspensions(withInactive: true) {
        beginAt
        endAt
        reason
      }
    }
  }
`

const Suspensions = ({ userId }) => {
  return (
    <Section>
      <SectionTitle>Sperrungen</SectionTitle>
      <Query query={GET_SUSPENSIONS} variables={{ id: userId }}>
        {({ loading, error, data }) => {
          const isInitialLoading = loading && !(data && data.user)
          return (
            <Loader
              loading={isInitialLoading}
              error={error}
              render={() => {
                const { user } = data
                const { isSuspended, suspendedUntil, suspensions } = user
                const suspendedHeader = isSuspended
                  ? `gesperrt bis am ${displayDate(suspendedUntil)}`
                  : 'nicht gesperrt'
                return (
                  <div>
                    <SectionSubhead>Aktuell </SectionSubhead>
                    {suspendedHeader}
                    <SectionSubhead>Vergangene Sperrungen </SectionSubhead>
                    <List>
                      {suspensions
                        .sort((a, b) => {
                          if (a.beginAt > b.beginAt) {
                            return -1
                          }
                          if (b.beginAt > a.beginAt) {
                            return 1
                          }
                          return 0
                        })
                        .map((suspension) => (
                          <Item>
                            <DT>
                              {displayDate(suspension.beginAt)} -{' '}
                              {displayDate(suspension.endAt)}
                            </DT>
                            <DD>
                              {suspension.reason ? suspension.reason : '--'}
                            </DD>
                          </Item>
                        ))}
                    </List>
                  </div>
                )
              }}
            />
          )
        }}
      </Query>
    </Section>
  )
}

export default Suspensions
