import * as React from 'react'
import {
  Interaction,
  Label,
  Button,
  A,
  colors
} from '@project-r/styleguide'
import {
  Pledge,
  PledgePayment,
  PaymentStatus
} from '../../../types/admin'
import withT from '../../../lib/withT'

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
  return (
    <div>
      <Interaction.H3>Pledge</Interaction.H3>
      <ul>
        <li>
          id: {pledge.id}
        </li>
        <li>
          total: {pledge.total}
        </li>
        <li>
          donation: {pledge.donation}
        </li>
        <li>
          reason: {pledge.reason}
        </li>
        <li>
          createdAt: {pledge.createdAt}
        </li>
        <li>
          updatedAt: {pledge.createdAt}
        </li>
        <li>
          package:
          <ul>
            <li>
              name: {pledge.package.name}
            </li>
          </ul>
        </li>
        <li>
          package options:
          {pledge.package.options.map(packageOption =>
            <ul key={`packageOption-${packageOption.id}`}>
              <li>
                reward:{' '}
                {packageOption.reward
                  ? packageOption.reward.name
                  : ''}
              </li>
              <li>
                price: {packageOption.price}
              </li>
            </ul>
          )}
        </li>
        <li>
          payments:
          {pledge.payments.map(payment =>
            <ul key={`payment-${payment.id}`}>
              <li>
                status: {payment.status}
              </li>
              <li>
                method: {payment.method}
              </li>
              <li>
                due date: {payment.dueDate}
              </li>
              <li>
                paper invoice: {payment.paperInvoice}
              </li>
              <li>
                createdAt: {payment.createdAt}
              </li>
              <li>
                updatedAt: {payment.createdAt}
              </li>
            </ul>
          )}
        </li>
        <li>
          memberships:
          {pledge.memberships.map(membership =>
            <ul key={`membership-${membership.id}`}>
              <li>
                sequence number: {membership.sequenceNumber}
              </li>
              <li>
                voucher code: {membership.voucherCode}
              </li>
              <li>
                reduced price: {membership.reducedPrice}
              </li>
              <li>
                claimer name: {membership.claimerName}
              </li>
              <li>
                created at: {membership.createdAt}
              </li>
              <li>
                updated at: {membership.updatedAt}
              </li>
            </ul>
          )}
        </li>
      </ul>

      <Button
        onClick={cancelPledgeHandler(
          onCancelPledge,
          pledge
        )}
      >
        {' '}Cancel pledge
      </Button>
      <Button
        onClick={resolvePledgeToPaymentHandler(
          onResolvePledge,
          pledge
        )}
      >
        {' '}Resolve Pledge
      </Button>
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
