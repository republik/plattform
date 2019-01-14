import React from 'react'
import {
  Interaction,
  Label,
  Button
} from '@project-r/styleguide'

import withT from '../../../lib/withT'
import List, { Item } from '../../List'
import MoveMembership from './MoveMembership'
import CancelMembership from './CancelMembership'
import routes from '../../../server/routes'
import { swissTime } from '../../../lib/utils/formats'

const { Link } = routes

const dateTimeFormat = swissTime.format(
  '%e. %B %Y %H.%M Uhr'
)

const getState = (membership) => {
  if (!membership.active) {
    return 'deaktiviert'
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

const MembershipOverview = ({
  membership,
  onMoveMembership,
  onReactivateMembership,
  onCancelMembership
}) => {

  return (
    <div>
      <Interaction.H3>
        {membership.type.name.split('_').join(' ')} –{' '}
        {dateTimeFormat(new Date(membership.createdAt))}
        <br />
        {getState(membership)}
      </Interaction.H3>
      <List>
        {membership.cancellations &&
           membership.cancellations.map((cancellation, i) => (
             <Item key={`cancellation-${i}`}>
               <Label>
                 {`Gekündigt am ${dateTimeFormat(new Date(cancellation.createdAt))} weil:`}
               </Label>
               <br />
               {cancellation.category.label}
               <br />
               {cancellation.revokedAt &&
                 <Label>{`Zurückgezogen am ${dateTimeFormat(new Date(cancellation.revokedAt))}`}</Label>}
               <br />
               {cancellation.reason &&
               <span>
                 <Label>Begründung</Label>
                 <br />
                 {cancellation.reason}
               </span>
                }
             </Item>
            ))}
        <Item>
          <Label>Abo-Nr.</Label>
          <br />
          #{membership.sequenceNumber}
          <br />
          <Interaction.P>
            <Label>Automatisch abbuchen</Label><br />{membership.autoPay ? 'YES' : 'NO'}
          </Interaction.P>
          {!!membership.voucherCode && (
            <Interaction.P>
              <Label>Voucher Code</Label>
              <br />
              {membership.voucherCode}
            </Interaction.P>
          )}
          {!!membership.claimerName && (
            <Interaction.P>
              <Label>Claimer Name</Label>
              <br />
              {membership.claimerName}
            </Interaction.P>
          )}
          {membership.user.id !== membership.pledge.user.id && (
            <Interaction.P>
              <Label>Geschenkt von</Label>
              <br />
              <Link
                route='user'
                params={{userId: membership.pledge.user.id}}>
                <a>
                    {membership.pledge.user.name}
                </a>
              </Link>
            </Interaction.P>
          )}
          <Interaction.P>
            <Label>Reduced Price</Label>
            <br />
            {membership.reducedPrice ? 'YES' : 'NO'}
          </Interaction.P>
          {membership.periods.length === 0 &&
            <Interaction.P>
              <Label>Periode (bei Aktivierung)</Label>
              <br />
              {membership.initialPeriods}{' '}
              {membership.initialInterval}
            </Interaction.P>
          }
          {membership.periods.length > 0 &&
            <Interaction.P>
              <Label>Perioden</Label>
              <br />
              {membership.periods.map((period, i) => (
                <span
                  style={{ display: 'inline-block' }}
                  key={`period-${i}`}
                >
                  {dateTimeFormat(new Date(period.beginDate))}
                  {' - '}
                  {dateTimeFormat(new Date(period.endDate))}
                  <br />
                  <Label>
                    Created:{' '}
                    {dateTimeFormat(
                      new Date(period.createdAt)
                    )}
                    {' – '}
                    Updated:{' '}
                    {dateTimeFormat(
                      new Date(period.updatedAt)
                    )}
                  </Label>
                </span>
              ))}
            </Interaction.P>
          }
        </Item>
      </List>
      <MoveMembership
        membership={membership}
        onSubmit={onMoveMembership}
      />
      {!!membership.renew && <CancelMembership
        membership={membership}
        onSubmit={onCancelMembership}
      />}
      {!membership.renew && (
        <Button
          onClick={() => onReactivateMembership(membership)}
          membership={membership}
          onSubmit={onMoveMembership}
        >
          (Re)Activate membership
        </Button>
      )}
    </div>
  )
}

export default withT(MembershipOverview)
