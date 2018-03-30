import React from 'react'
import {
  Interaction,
  Label,
  P,
  Button
} from '@project-r/styleguide'

import withT from '../../../lib/withT'
import List, { Item } from '../../List'
import MoveMembership from './MoveMembership'

import { swissTime } from '../../../lib/utils/formats'
const dateTimeFormat = swissTime.format(
  '%e. %B %Y %H.%M Uhr'
)

const MembershipOverview = ({
  membership,
  onMoveMembership,
  onReactivateMembership
}) => {
  return (
    <div>
      <Interaction.H3>
        {membership.type.name.split('_').join(' ')} –{' '}
        {dateTimeFormat(new Date(membership.createdAt))} –{' '}
        {(!!membership.renew && 'ACTIVE') || 'INACTIVE'}
        <br />
        <Label>
          Created:{' '}
          {dateTimeFormat(new Date(membership.createdAt))}
          {' – '}
          Updated:{' '}
          {dateTimeFormat(new Date(membership.updatedAt))}
        </Label>
      </Interaction.H3>
      {!membership.renew && (
        <Label>
          Reason for cancelled membership
          <P>
            {membership.cancelReasons &&
              membership.cancelReasons.join('\n')}
          </P>
        </Label>
      )}
      <List>
        <Item>
          <Label>Abo-Nr.</Label>
          <br />
          #{membership.sequenceNumber}
          <br />
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
          <Interaction.P>
            <Label>Reduced Price</Label>
            <br />
            {membership.reducedPrice ? 'YES' : 'NO'}
          </Interaction.P>
          <Interaction.P>
            <Label>Periods</Label>
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
        </Item>
      </List>
      <MoveMembership
        membership={membership}
        onSubmit={onMoveMembership}
      />
      {!membership.active && (
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
