import { gql } from '@apollo/client'

import { styles } from '@/components/Zat/utils'

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
    <div className={styles.part}>
      {sessions.map(({ id, userAgent }) => (
        <div key={id}>{userAgent}</div>
      ))}
    </div>
  )

export default Sessions
