import { Fragment } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { Label, Loader, A } from '@project-r/styleguide'

import {
  displayDate,
  displayStyles,
  displayDateTime,
  Section,
  SectionTitle,
  DL,
  DT,
  DD
} from '../../Display/utils'
import { tableStyles } from '../../Tables/utils'
import routes from '../../../server/routes'

import MoveMembership from './MoveMembership'
import CancelMembership from './CancelMembership'
import ReactivateMembership from './ReactivateMembership'
const { Link } = routes


const GET_MEMBERSHIPS = gql`
  query memberships($id: String) {
    user(slug: $id) {
      id
      memberships {
        id
        type {
          name
        }
        user {
          id
        }
        pledge {
          user {
            id
            name
          }
        }
        sequenceNumber
        initialInterval
        initialPeriods
        claimerName
        periods {
          beginDate
          endDate
        }
        cancellations {
          reason
          category {
            label
            type
          }
          createdAt
          revokedAt
        }
        voucherCode
        claimerName
        reducedPrice
        autoPay
        createdAt
        active
        renew
      }
    }
  }
`

const getState = (membership) => {
  if (!membership.active) {
    if (!!membership.periods.length) {
      return 'deaktiviert'
    }

    if (membership.voucherCode) {
      return 'uneingelöst'
    }

    return 'inaktiv'
  }

  if (!membership.renew) {
    return 'aktiv, läuft aus'
  }

  const latestPeriod = membership.periods.reduce((acc, curr) => {
    return acc && new Date(acc.endDate) > new Date(curr.endDate) ? acc : curr
  })

  const overdue = latestPeriod && new Date(latestPeriod.endDate) < new Date()
  if (overdue) {
    return 'aktiv, Erneuerung überfällig'
  }

  return 'aktiv'
}

const MembershipCard = ({ membership, ...props }) => {
  return (
    <tr {...tableStyles.row} {...props}>
      <td {...tableStyles.paddedCell}>
        {membership.type.name.split('_').join(' ')} #
        {membership.sequenceNumber}{' '}
        <br />
        <Label>
          Erstellt am{' '}
          {displayDateTime(membership.createdAt)}
        </Label>
      </td>
      <td {...tableStyles.paddedCell}>
        {getState(membership)}
      </td>
    </tr>
  )
}

const MembershipDetails = ({ membership, ...props }) => {
  return (
    <tr {...props}>
      <td {...tableStyles.paddedCell} colSpan={2}>
        <div {...displayStyles.hFlexBox}>
          <DL>
            <DT>Automatisch abbuchen</DT>
            <DD>{membership.autoPay ? 'YES' : 'NO'}</DD>
            {!!membership.voucherCode && (
              <Fragment>
                <DT>Voucher Code</DT>
                <DD>{membership.voucherCode}</DD>
              </Fragment>
            )}
            {membership.user.id !== membership.pledge.user.id && (
              <Fragment>
                <DT>Gekauft durch</DT>
                <DD>
                  <Link
                    route='user'
                    params={{userId: membership.pledge.user.id}}
                    passHref>
                      <A>{membership.pledge.user.name}</A>
                  </Link>
                </DD>
              </Fragment>
            )}
          </DL>
          <DL>
            <DT>Reduced Price</DT>
            <DD>{membership.reducedPrice ? 'YES' : 'NO'}</DD>
          </DL>
          <DL>
            {!membership.active && (
              <Fragment>
                <DT>Standard-Laufzeit</DT>
                <DD>
                  {membership.initialPeriods}{' '}
                  {membership.initialInterval}
                </DD>
              </Fragment>
            )}
            {!!membership.periods.length && (
              <Fragment>
                <DT>Laufzeiten</DT>
                {membership.periods.map((period, i) => (
                  <DD key={`period-${i}`}>
                  {displayDate(
                    new Date(period.beginDate)
                  ).concat(
                    ' - ',
                    displayDate(new Date(period.endDate))
                  )}
                  </DD>
                ))}
              </Fragment>
            )}
          </DL>
          </div>
          {!!membership.cancellations && !!membership.cancellations.length &&
             <DL>
              <hr />
              <DT>Kündigungen</DT>
              {membership.cancellations.map((cancellation, i) => (
                <Fragment key={`cancellation-${i}`}>
                  <div {...displayStyles.hFlexBox} >
                    <DL>
                      <DT>Gekündigt am</DT>
                      <DD>{displayDateTime(cancellation.createdAt)}</DD>
                      {cancellation.revokedAt &&
                        <Fragment>
                          <DT>Zurückgezogen am</DT>
                          <DD>{displayDateTime(cancellation.revokedAt)}</DD>
                        </Fragment>
                      }
                    </DL>
                    <DL>
                      <DT>Grund</DT>
                      <DD>{cancellation.category.label}</DD>
                    </DL>
                 </div>
                 {cancellation.reason &&
                   <DD>{cancellation.reason}</DD>
                 }
               </Fragment>
              ))}
             </DL>}
          <DL>
            <DT>Aktionen</DT>
            <DD>
                <MoveMembership
                  membership={membership}
                  refetchQueries={({
                    data: { moveMembership }
                  }) => [
                    {
                      query: GET_MEMBERSHIPS,
                      variables: { id: moveMembership.id }
                    }
                  ]}
                />
                {!!membership.renew &&
                  <CancelMembership
                    membership={membership}
                    refetchQueries={({
                      data: { cancelMembership }
                    }) => [
                      {
                        query: GET_MEMBERSHIPS,
                        variables: { id: cancelMembership.id }
                      }
                    ]}
                  />
                }
                {!membership.renew && membership.active &&
                  <ReactivateMembership
                    membership={membership}
                    refetchQueries={({
                      data: { reactivateMembership }
                    }) => [
                      {
                        query: GET_MEMBERSHIPS,
                        variables: { id: reactivateMembership.id }
                      }
                    ]}
                  />
                }
            </DD>
          </DL>
      </td>
    </tr>
  )
}

export default ({ userId }) => {
  return (
    <Query
      query={GET_MEMBERSHIPS}
      variables={{ id: userId }}
    >
      {({ loading, error, data }) => {
        const isInitialLoading =
          loading &&
          !(data && data.user && data.user.memberships)
        return (
          <Loader
            loading={isInitialLoading}
            error={isInitialLoading && error}
            render={() => {
              const {
                user: { memberships }
              } = data
              return (
                <Section>
                  <SectionTitle>Memberships</SectionTitle>
                  <table {...tableStyles.table}>
                    <colgroup>
                      <col style={{ width: '50%' }} />
                      <col style={{ width: '50%' }} />
                    </colgroup>
                    <tbody>
                      {memberships.map(m => (
                        <Fragment key={m.id}>
                          <MembershipCard
                            key={`card-${m.id}`}
                            membership={m}
                          />
                          <MembershipDetails
                            key={`details-${m.id}`}
                            membership={m}
                          />
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </Section>
              )
            }}
          />
        )
      }}
    </Query>
  )
}
