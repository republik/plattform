import React from 'react'
import gql from 'graphql-tag'

import { displayDate } from '../../Display/utils'
import { styles } from '../utils'

export const fragments = gql`
  fragment UserAccessGrants on User {
    accessGrants {
      id
      endAt
    }
  }
`

export const AccessGrants = ({ accessGrants }) =>
  accessGrants?.map((accessGrant) => {
    const { id, endAt } = accessGrant

    return (
      <div key={id} {...styles.part}>
        Access Grant bis {displayDate(endAt)}
      </div>
    )
  })

export default AccessGrants
