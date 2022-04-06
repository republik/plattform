import gql from 'graphql-tag'

import { styles } from '../utils'

export const fragments = gql`
  fragment UserSessions on User {
    sessions {
      id
      userAgent
    }
  }
`

export const Sessions = ({ sessions }) =>
  !!sessions?.length && (
    <div {...styles.part}>
      {sessions.map(({ id, userAgent }) => (
        <div key={id}>{userAgent}</div>
      ))}
    </div>
  )

export default Sessions
