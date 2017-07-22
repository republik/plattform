import * as React from 'react'
import {
  Interaction,
  Label,
  Button,
  A,
  P,
  colors
} from '@project-r/styleguide'
import { Membership } from '../../../types/admin'
import withT from '../../../lib/withT'
import {
  swissTime,
  chfFormat
} from '../../../lib/utils/formats'
import List, { Item } from '../../List'

const dateTimeFormat = swissTime.format(
  '%e. %B %Y %H.%M Uhr'
)
const dateFormat = swissTime.format('%e. %B %Y')

const MembershipOverview = ({
  membership,
  t
}: {
  membership: Membership
  t: any
}) => {
  return (
    <div>
      <Interaction.H3>
        {membership.type.name} –{' '}
        {dateTimeFormat(new Date(membership.createdAt))}
        <br />
        <Label>
          Updated:{' '}
          {dateTimeFormat(new Date(membership.updatedAt))}
          {/* – ID: {pledge.id} */}
        </Label>
      </Interaction.H3>
      <List>
        <Item>
          <Label>Abo-Nr.</Label>
          <br />
          #{membership.sequenceNumber}
          <br />
          {!!membership.voucherCode &&
            <Interaction.P>
              <Label>Voucher Code</Label>
              <br />
              {membership.voucherCode}
            </Interaction.P>}
          {!!membership.claimerName &&
            <Interaction.P>
              <Label>Claimer Name</Label>
              <br />
              {membership.claimerName}
            </Interaction.P>}
          <Interaction.P>
            <Label>Reduced Price</Label>
            <br />
            {membership.reducedPrice ? 'YES' : 'NO'}
          </Interaction.P>
          <Label>
            Created:{' '}
            {dateTimeFormat(new Date(membership.createdAt))}
            {' – '}
            Updated:{' '}
            {dateTimeFormat(new Date(membership.updatedAt))}
          </Label>
        </Item>
      </List>
    </div>
  )
}

export default withT(MembershipOverview)
