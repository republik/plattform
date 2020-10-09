import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { Label, Loader } from '@project-r/styleguide'

import {
  displayDateTime,
  Section,
  SectionTitle
} from '../Display/utils'

import { tableStyles } from '../Tables/utils'


export const GET_EVENT_LOG = gql`
  query eventlog($id: String) {
    user(slug: $id) {
      id
      eventLog {
        type
        createdAt
        archivedSession {
          email
          userAgent
          isCurrent
        }
        activeSession {
          isCurrent
        }
      }
    }
  }
`

const EventLogTable = ({ entries, ...props }) => (
  <table {...props} {...tableStyles.table}>
    <colgroup>
      <col style={{ width: '50%' }} />
      <col style={{ width: '50%' }} />
    </colgroup>
    <tbody>
      {entries.map((entry, index) => (
        <tr {...tableStyles.row} key={`log-entry-${index}`}>
          <td {...tableStyles.tableStyles}>
            {entry.type.split('_').join(' ')}
            <br />
            <Label>
              {displayDateTime(entry.createdAt)}
            </Label>
          </td>
          <td {...tableStyles.paddedCell}>
            <Label>{entry.archivedSession.email}</Label>
            <br />
            <Label>{entry.archivedSession.userAgent}</Label>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

const EventLog = ({ userId }) => {
  return (
    <Query query={GET_EVENT_LOG} variables={{ id: userId }}>
      {({ loading, error, data }) => {
        const isInitialLoading =
          loading &&
          !(data && data.user && data.user.eventLog)
        return (
          <Loader
            loading={isInitialLoading}
            error={isInitialLoading && error}
            render={() => {
              const {
                user: { eventLog: entries }
              } = data
              return (
                <Section>
                  <SectionTitle>
                    Letzte Login-Aktivitäten
                  </SectionTitle>
                  <EventLogTable
                    entries={entries}
                  />
                </Section>
              )
            }}
          />
        )
      }}
    </Query>
  )
};

export default EventLog;
