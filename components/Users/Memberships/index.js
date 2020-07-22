import React, { Fragment } from 'react'
import { css } from 'glamor'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { MdChevronLeft as CurrentIcon } from 'react-icons/md'

import {
  A,
  Button,
  Checkbox,
  colors,
  Dropdown,
  Field,
  InlineSpinner,
  Label,
  Loader,
  Spinner,
} from '@project-r/styleguide'

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
import { Link } from '../../../server/routes'


import { REPUBLIK_FRONTEND_URL } from '../../../server/constants'

import MoveMembership from './MoveMembership'
import CancelMembership from './CancelMembership'
import ReactivateMembership from './ReactivateMembership'
import AppendPeriod from './AppendPeriod'

import { intersperse } from '../../../lib/helpers'

const styles = {
  icon: css({
    verticalAlign: 'baseline',
    marginRight: 3,
    marginBottom: '-0.2em'
  })
}

const GET_MEMBERSHIPS = gql`
  query memberships($userId: String!) {
    user(slug: $userId) {
      id
      accessToken(scope: CUSTOM_PLEDGE)
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
          id
          beginDate
          endDate
          isCurrent
        }
        cancellations {
          id
          reason
          suppressConfirmation
          suppressWinback
          cancelledViaSupport
          category {
            label
            type
          }
          createdAt
          revokedAt
          winbackSentAt
          winbackCanBeSent
        }
        voucherCode
        claimerName
        reducedPrice
        autoPay
        autoPayIsMutable
        createdAt
        active
        renew
        canAppendPeriod
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
  }, undefined) // explicit initial undefined needed for empty arrays

  const overdue = latestPeriod && new Date(latestPeriod.endDate) < new Date()
  if (overdue) {
    return 'aktiv, Erneuerung überfällig'
  }

  return 'aktiv'
}


const SET_AUTO_PAY = gql`
  mutation setMembershipAutoPay($id: ID!, $autoPay: Boolean!) {
    setMembershipAutoPay(id: $id, autoPay: $autoPay) {
      id
      autoPay
    }
  }
`

const autoPayOptions = [
  {value: 'true', text: 'Yes'},
  {value: 'false', text: 'No'}
]

const AutoPayToggle = (membership) => {

  if (!membership.autoPayIsMutable) return (
    <React.Fragment>
      <DT>
        Automatisch abbuchen
      </DT>
      <DD>
        { membership.autoPay ? 'YES' : 'NO' }
      </DD>
    </React.Fragment>
  )

  // Currently the dropdown component only supports string values
  const autoPayAsString = membership.autoPay ? 'true' : 'false';

  return (
    <Mutation mutation={SET_AUTO_PAY}>
      {(mutation, {loading, error}) => {

        return (
          <React.Fragment>
            <DT>
              Automatisch abbuchen
              {error && (
                <React.Fragment>
                  <br/>
                  <span style={{color: colors.error}}>
                    {error.message}
                  </span>
                </React.Fragment>
              )}
            </DT>
            <DD style={{
              position: 'relative',
              pointerEvents: loading ? 'none' : 'auto'
            }}
            >
              { loading && (<Spinner/>) }
              <Dropdown
                black
                label=''
                items={autoPayOptions}
                value={autoPayAsString}
                onChange={(item) => mutation({
                  variables: {
                    id: membership.id,
                    autoPay: item.value === 'true'
                  }
                })}
              />
            </DD>
          </React.Fragment>
        )
      }}
    </Mutation>
  )
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
        <br />
        <Label>ID: {membership.id}</Label>
      </td>
      <td {...tableStyles.paddedCell}>
        {getState(membership)}
      </td>
    </tr>
  )
}

const MembershipDetails = ({ userId, membership, ...props }) => {
  return (
    <tr {...props}>
      <td {...tableStyles.paddedCell} colSpan={2}>
        <div {...displayStyles.hFlexBox}>
          <DL>
            <AutoPayToggle {... membership}></AutoPayToggle>
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
                {membership.periods.map((period) => (
                  <DD key={`period-${period.id}`}>
                    {displayDate(new Date(period.beginDate))} – {displayDate(new Date(period.endDate))}
                    {period.isCurrent && <CurrentIcon size='1.1em' {...styles.icon} />}
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
                    </DL>
                    <DL>
                      <DT>Grund</DT>
                      <DD>{cancellation.category.label}</DD>
                    </DL>
                    <DL>
                      <DT>keine Bestätigung</DT>
                      <DD>
                        <Checkbox
                         checked={cancellation.suppressConfirmation}
                         disabled={true}
                        />
                      </DD>
                    </DL>
                    <DL>
                      <DT>kein Winback</DT>
                      <DD>
                        <Checkbox
                         checked={cancellation.suppressWinback}
                         disabled={true}
                        />
                      </DD>
                    </DL>
                    <DL>
                      <DT>via Support</DT>
                      <DD>
                        <Checkbox
                         checked={cancellation.cancelledViaSupport}
                         disabled={true}
                        />
                      </DD>
                    </DL>
                 </div>
                 <div {...displayStyles.hFlexBox}>
                   <DL>
                     {cancellation.reason &&
                       <Fragment>
                         <DT>Erläuterungen</DT>
                         <DD>{cancellation.reason}</DD>
                       </Fragment>
                     }
                   </DL>
                 </div>
                 <div {...displayStyles.hFlexBox}>
                   {cancellation.winbackSentAt &&
                     <DL>
                       <DT>Winback verschickt am</DT>
                       <DD>{displayDateTime(cancellation.winbackSentAt)}</DD>
                     </DL>
                   }
                   {cancellation.revokedAt &&
                     <DL>
                       <DT>Zurückgezogen am</DT>
                       <DD>{displayDateTime(cancellation.revokedAt)}</DD>
                     </DL>
                   }
                 </div>
                 <div {...displayStyles.hFlexBox}>
                   <DL>
                     <DT>Kündigungs Aktionen</DT>
                     <DD>
                       <CancelMembership
                         membership={membership}
                         cancellation={cancellation}
                         refetchQueries={() => [
                           {
                             query: GET_MEMBERSHIPS,
                             variables: { userId }
                           }
                         ]}
                       />
                     </DD>
                   </DL>
                 </div>
               </Fragment>
              ))}
             </DL>}
          <DL>
            <DT>Membership Aktionen</DT>
            <DD>
                {intersperse([
                  membership.canAppendPeriod && <AppendPeriod key='AppendPeriod' membership={membership}></AppendPeriod>,
                  <MoveMembership
                    key='MoveMembership'
                    membership={membership}
                    refetchQueries={({
                      data: { moveMembership }
                    }) => [
                      {
                        query: GET_MEMBERSHIPS,
                        variables: { userId }
                      }
                    ]}
                  />,
                  !!membership.renew &&
                    <CancelMembership
                      key='CancelMembership'
                      membership={membership}
                      refetchQueries={() => [
                        {
                          query: GET_MEMBERSHIPS,
                          variables: { userId }
                        }
                      ]}
                    />,
                  !membership.renew && membership.active &&
                    <ReactivateMembership
                      key='ReactivateMembership'
                      membership={membership}
                      refetchQueries={({
                        data: { reactivateMembership }
                      }) => [
                        {
                          query: GET_MEMBERSHIPS,
                          variables: { userId }
                        }
                      ]}
                    />,
                  (!membership.active || !membership.renew) && membership.type.name === 'MONTHLY_ABO' &&
                    <ReactivateMembership
                      key='ReactivateMonthly'
                      membership={membership}
                      refetchQueries={({
                        data: { reactivateMembership }
                      }) => [
                        {
                          query: GET_MEMBERSHIPS,
                          variables: { userId }
                        }
                      ]}
                    />,
                ].filter(Boolean), () => ', ')}
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
      variables={{ userId }}
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
                user: { memberships, accessToken }
              } = data
              return (
                <Section>
                  <SectionTitle>Memberships</SectionTitle>
                  <div style={{ marginBottom: 20 }}>
                    <A
                      href={`${REPUBLIK_FRONTEND_URL}/angebote?package=PROLONG&token=${accessToken}`}
                      target="_blank"
                    >
                      Verlängerns-Link ohne anmelden
                    </A>
                    <br />
                    <Label>In einem neuen, privaten Fenster öffnen.</Label>
                  </div>
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
                            userId={userId}
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
