import { Fragment } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { Label, Loader } from '@project-r/styleguide'

import {
  displayDate,
  displayDateTime,
  Section,
  SectionTitle,
  DL,
  DT,
  DD
} from '../Display/utils'
import { tableStyles } from '../Tables/utils'

const GET_MEMBERSHIPS = gql`
  query memberships($id: String) {
    user(slug: $id) {
      id
      memberships {
        id
        type {
          name
        }
        sequenceNumber
        claimerName
        periods {
          beginDate
          endDate
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

const MembershipCard = ({ membership, ...props }) => {
  const currentPeriod =
    membership.periods &&
    membership.periods.length &&
    membership.periods[0]
  return (
    <tr {...tableStyles.row} {...props}>
      <td {...tableStyles.paddedCell}>
        {membership.type.name.split('_').join(' ')} #
        {membership.sequenceNumber}
        <br />
        <Label>
          Erstellt am{' '}
          {displayDateTime(membership.createdAt)}
        </Label>
      </td>
      {currentPeriod && (
        <td {...tableStyles.paddedCell}>
          {displayDate(
            new Date(currentPeriod.beginDate)
          ).concat(
            ' - ',
            displayDate(new Date(currentPeriod.endDate))
          )}
        </td>
      )}
    </tr>
  )
}

const MembershipDetails = ({ membership, ...props }) => {
  return (
    <tr {...props}>
      <td {...tableStyles.paddedCell} colSpan={2}>
        <DL>
          <DT>Automatisch abbuchen</DT>
          <DD>{membership.autoPay ? 'YES' : 'NO'}</DD>
        </DL>
        {!!membership.voucherCode && (
          <DL>
            <DT>Voucher Code</DT>
            <DD>{membership.voucherCode}</DD>
          </DL>
        )}
        {!!membership.claimerName && (
          <DL>
            <DT>Claimer Name</DT>
            <DD>{membership.claimerName}</DD>
          </DL>
        )}
        <DL>
          <DT>Reduced Price</DT>
          <DD>{membership.reducedPrice ? 'YES' : 'NO'}</DD>
        </DL>
        <DL>
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
