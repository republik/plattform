import * as React from 'react'
import {
  Interaction,
  Label,
  Button,
  A,
  P,
  colors
} from '@project-r/styleguide'
import {
  Pledge,
  PledgePayment,
  PaymentStatus
} from '../../../types/admin'
import withT from '../../../lib/withT'
import { css } from 'glamor'
import {
  swissTime,
  chfFormat
} from '../../../lib/utils/formats'
import List, { Item } from '../../List'

const link = css({
  textDecoration: 'none',
  color: colors.primary,
  ':visited': {
    color: colors.primary
  },
  ':hover': {
    color: colors.secondary
  }
})

const dateTimeFormat = swissTime.format(
  '%e. %B %Y %H.%M Uhr'
)
const dateFormat = swissTime.format('%e. %B %Y')

const cancelPledgeHandler = (
  handler: any,
  pledge: Pledge
) => () => {
  if (handler) {
    if (confirm('Sure you want to do that?')) {
      handler({ pledgeId: pledge.id })
    }
  }
}

const resolvePledgeToPaymentHandler = (
  handler: any,
  pledge: Pledge
) => () => {
  if (handler) {
    const reason = prompt('Reason')
    handler({ pledgeId: pledge.id, reason })
  }
}

const updatePaymentStatusHandler = (
  handler: any,
  pledge: Pledge
) => () => {
  if (handler && pledge.payments.length > 0) {
    const payment = pledge.payments[0]
    if (payment.status === 'WAITING_FOR_REFUND') {
      handler({ paymentId: payment.id, status: 'REFUNDED' })
    } else if (payment.status === 'WAITING') {
      const reason = prompt('Reason')
      handler({
        paymentId: payment.id,
        status: 'PAID',
        reason
      })
    }
  }
}

const PaymentStatusButton = ({ pledge, ...props }: any) => {
  if (pledge.payments.length <= 0) {
    return null
  } else {
    const status = pledge.payments[0].status
    if (
      status === 'WAITING' ||
      status === 'WAITING_FOR_REFUND'
    ) {
      const label =
        status === 'WAITING'
          ? 'Set to paid'
          : 'Set to refunded'
      return (
        <Button {...props}>
          {label}
        </Button>
      )
    } else {
      return null
    }
  }
}

const PledgeOverview = ({
  pledge,
  t,
  onUpdatePaymentStatus,
  onResolvePledge,
  onCancelPledge
}: {
  pledge: Pledge
  t: any
  onUpdatePaymentStatus: any
  onResolvePledge: any
  onCancelPledge: any
}) => {
  const options = pledge.options.filter(
    option =>
      option.amount && option.minAmount !== option.maxAmount
  )

  return (
    <div>
      <Interaction.H3>
        {pledge.package.name} –{' '}
        {dateTimeFormat(new Date(pledge.createdAt))} -{' '}
        {pledge.status}
        <br />
        <Label>
          Updated:{' '}
          {dateTimeFormat(new Date(pledge.updatedAt))}
          {/* – ID: {pledge.id} */}
        </Label>
      </Interaction.H3>
      <Interaction.P>
        <Label>Total</Label>
        <br />
        {chfFormat(pledge.total / 100)}
      </Interaction.P>
      <Interaction.P>
        <Label>Donation</Label>
        <br />
        {chfFormat(pledge.donation / 100)}
      </Interaction.P>
      {!!pledge.reason &&
        <P>
          <Label>Reason</Label>
          <br />
          {pledge.reason}
        </P>}
      <List>
        {!!options.length &&
          options.map((option, i) =>
            <Item key={`option-${i}`}>
              <Label>Option</Label>
              <br />
              {option.amount} x{' '}
              {option.reward ? option.reward.name : ''} a{' '}
              {chfFormat(option.price / 100)}
            </Item>
          )}
        {pledge.payments.map((payment, i) =>
          <Item key={`payment-${i}`}>
            <Label>Payment</Label>
            <br />
            {payment.method === 'STRIPE' &&
              <a
                className={`${link}`}
                href={`https://dashboard.stripe.com/payments/${payment.pspId}`}
                target="_blank"
              >
                STRIPE
              </a>}
            {payment.method !== 'STRIPE' && payment.method}
            {' - '} {payment.status}
            <br />
            <Interaction.P>
              <Label>Total</Label>
              <br />
              {chfFormat(payment.total / 100)}
            </Interaction.P>
            <Interaction.P>
              <Label>HR-ID</Label>
              <br />
              {payment.hrid}
            </Interaction.P>
            {!!payment.dueDate &&
              <Interaction.P>
                <Label>Due Date</Label>
                <br />
                {dateFormat(new Date(payment.dueDate))}
              </Interaction.P>}
            {payment.method === 'PAYMENTSLIP' &&
              <Interaction.P>
                <Label>Paper Invoice</Label>
                <br />
                {payment.paperInvoice ? 'YES' : 'NO'}
              </Interaction.P>}
            <Label>
              Created:{' '}
              {dateTimeFormat(new Date(payment.createdAt))}
              {' – '}
              Updated:{' '}
              {dateTimeFormat(new Date(payment.updatedAt))}
            </Label>
          </Item>
        )}
        {pledge.memberships.map((membership, i) =>
          <Item key={`membership-${i}`}>
            <Label>Membership</Label>
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
              {dateTimeFormat(
                new Date(membership.createdAt)
              )}
              {' – '}
              Updated:{' '}
              {dateTimeFormat(
                new Date(membership.updatedAt)
              )}
            </Label>
          </Item>
        )}
      </List>
      {pledge.status !== 'CANCELLED' &&
        <Button
          onClick={cancelPledgeHandler(
            onCancelPledge,
            pledge
          )}
        >
          {' '}Cancel pledge
        </Button>}
      {pledge.status === 'PAID_INVESTIGATE' &&
        <Button
          onClick={resolvePledgeToPaymentHandler(
            onResolvePledge,
            pledge
          )}
        >
          {' '}Resolve Pledge
        </Button>}
      <PaymentStatusButton
        pledge={pledge}
        onClick={updatePaymentStatusHandler(
          onUpdatePaymentStatus,
          pledge
        )}
      />
    </div>
  )
}

export default withT(PledgeOverview)
