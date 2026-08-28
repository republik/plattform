import { gql } from '@apollo/client'

import { styles } from '../utils'

export const fragments = gql`
  fragment UserSessions on User {
    sessions {
      id
      userAgent
      device {
        information {
          appVersion
          os
          osVersion
          model
        }
        lastSeen
      }
    }
  }
`

export const Sessions = ({ sessions }) =>
  !!sessions?.length && (
    <div {...styles.part}>
      {sessions.map(({ id, userAgent, device }) => (
        <div key={id}>
          {device
            ? `${device.information.os.toUpperCase()} ${device.information.osVersion} · ${device.information.model} · App ${device.information.appVersion}`
            : userAgent}
        </div>
      ))}
    </div>
  )

export default Sessions
