import gql from 'graphql-tag'

import { displayDate } from '../../Display/utils'
import { styles } from './../utils'

export const fragments = gql`
  fragment UserMemberships on User {
    activeMembership {
      type {
        name
      }
      overdue
      renew
    }
    memberships {
      id
      periods {
        beginDate
        endDate
      }
    }
  }
`

const getLastPeriod = (periods) =>
  periods?.reduce((accumulator, currentValue) => {
    return !accumulator || currentValue.endDate > accumulator.endDate
      ? currentValue
      : accumulator
  }, false)

const getFirstPeriod = (periods) =>
  periods?.reduce((accumulator, currentValue) => {
    return !accumulator || currentValue.beginDate < accumulator.beginDate
      ? currentValue
      : accumulator
  }, false)

export const Memberships = ({ activeMembership, memberships }) => {
  const periods = memberships?.map((m) => m.periods).flat()

  const lastPeriod = getLastPeriod(periods)

  if (!activeMembership) {
    return (
      lastPeriod && (
        <div {...styles.part}>
          ehemalig{' · '}bis {displayDate(lastPeriod.endDate)}
        </div>
      )
    )
  }

  const firstPeriod = getFirstPeriod(periods)

  return (
    <div {...styles.part}>
      {activeMembership.type?.name}
      {!activeMembership.renew && <>{' · '}gekündigt</>}
      {!!activeMembership.overdue && !!activeMembership.renew && (
        <>{' · '}überfällig</>
      )}
      {lastPeriod && (
        <>
          {' · '}bis {displayDate(lastPeriod.endDate)}
        </>
      )}
      {firstPeriod && (
        <>
          {' · '}dabei seit {displayDate(firstPeriod.beginDate)}
        </>
      )}
    </div>
  )
}

export default Memberships
