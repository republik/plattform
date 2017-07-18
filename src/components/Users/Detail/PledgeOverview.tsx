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
import { Container, Tile } from '../../Layout/Grid'
import { Table, Row, Cell } from '../../Layout/Table'
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
  if (pledge.payments.length < 0) {
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
      <p>
        {pledge.package.name}:
        {pledge.total}
      </p>
      <Container direction="row" justifyContent="stretch">
        <Tile flex="0 0 50%">
          <Label>Package options</Label>
          <Table>
            {pledge.package.options.map(packageOption =>
              <Row
                key={`packageOption-${packageOption.id}`}
              >
                <Cell>
                  {packageOption.reward
                    ? packageOption.reward.name
                    : ''}
                </Cell>
                <Cell flex="0 0 100px">
                  {packageOption.price}
                </Cell>
              </Row>
            )}
          </Table>
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
        </Tile>
        <Tile>
          <Label>Payments</Label>
          <Table>
            {pledge.payments.map(payment =>
              <ul key={payment.id}>
                <li>
                  {payment.status}
                </li>
                <li>
                  {payment.total}
                </li>
              </ul>
            )}
          </Table>
        </Tile>
      </Container>
    </div>
  )
}

export default withT(PledgeOverview)
