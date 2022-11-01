import { gql, useMutation } from '@apollo/client'
import { Query } from '@apollo/client/react/components'
import {
  Section,
  SectionTitle,
  displayDate,
  SectionSubhead,
  DT,
  DD,
  dateDiff,
} from '../../Display/utils'
import { Loader, Label } from '@project-r/styleguide'
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

const SUSPEND_USER = gql`
  mutation SuspendUser($id: ID!, $until: DateTime, $reason: String) {
    suspendUser(id: $id, until: $until, reason: $reason) {
      id
    }
  }
`

const UNSUSPEND_USER = gql`
  mutation UnsuspendUser($id: ID!) {
    unsuspendUser(id: $id) {
      id
    }
  }
`

const Suspensions = ({ userId }) => {
  const [suspendUser, suspendUserState] = useMutation(SUSPEND_USER, {
    variables: { id: userId },
    refetchQueries: [{ query: GET_SUSPENSIONS, variables: { id: userId } }],
  })

  const [unsuspendUser, unsuspendUserState] = useMutation(UNSUSPEND_USER, {
    variables: { id: userId },
    refetchQueries: [{ query: GET_SUSPENSIONS, variables: { id: userId } }],
  })

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
                    <SectionSubhead>Aktuell {suspendedHeader}</SectionSubhead>
                    {isSuspended ? (
                      <button
                        onClick={() => {
                          unsuspendUser()
                        }}
                      >
                        Entsperren
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          suspendUser()
                        }}
                      >
                        Sperren
                      </button>
                    )}
                    {!!suspensions.length && (
                      <SectionSubhead>Alle Sperrungen</SectionSubhead>
                    )}
                    <List>
                      {[...suspensions]
                        .sort((a, b) => {
                          return new Date(b.beginAt) - new Date(a.beginAt)
                        })
                        .map((suspension, i) => (
                          <Item key={i}>
                            <DT>
                              {displayDate(suspension.beginAt)} -{' '}
                              {displayDate(suspension.endAt)} (
                              {dateDiff(suspension.beginAt, suspension.endAt)})
                            </DT>
                            <DD>
                              <Label>
                                {suspension.reason
                                  ? suspension.reason
                                  : 'kein Grund angegeben'}
                              </Label>
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
