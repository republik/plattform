import { Fragment, Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { merge } from 'glamor'

import { Loader, Label } from '@project-r/styleguide'

import { chfFormat } from '../../../lib/utils/formats'

import {
  displayStyles,
  Section,
  SectionTitle,
  SectionSubhead,
  displayDateTime,
  displayDate,
  DL,
  DT,
  DD
} from '../../Display/utils'
import { tableStyles } from '../../Tables/utils'

import MovePledge from './MovePledge'
import ResolvePledgeToPayment from './ResolvePledgeToPayment'
import CancelPledge from './CancelPledge'
import UpdatePayment from './UpdatePayment'
import SendPaymentReminder from './SendPaymentReminder'

const GET_PLEDGES = gql`
  query pledges($id: String) {
    user(slug: $id) {
      id
      pledges {
        id
        total
        status
        reason
        donation
        memberships {
          id
          sequenceNumber
        }
        payments {
          id
          total
          status
          method
          hrid
          paperInvoice
          dueDate
          remindersSentAt
          createdAt
          updatedAt
        }
        package {
          name
        }
        createdAt
      }
    }
  }
`

const PledgeCard = ({ pledge, ...props }) => {
  const payment = pledge.payments[0]
  const membership = pledge.memberships[0]
  return (
    <tr
      {...merge(tableStyles.row, tableStyles.selectableRow)}
      {...props}
    >
      <td {...tableStyles.paddedCell}>
        {pledge.package.name.split('_').join(' ')}
        {membership && ` #${membership.sequenceNumber}`}
        {' - '}
        {pledge.status}
        <br />
        <Label>
          Erstellt am {displayDateTime(pledge.createdAt)}
        </Label>
      </td>
      <td {...tableStyles.paddedCell}>
        {chfFormat(pledge.total / 100)}
        {payment && (
          <Fragment>
            <br />
            <Label>
              {payment.method === 'STRIPE' && (
                <a
                  {...tableStyles.link}
                  href={`https://dashboard.stripe.com/payments/${
                    payment.pspId
                  }`}
                  target="_blank"
                >
                  STRIPE
                </a>
              )}
              {payment.method !== 'STRIPE' &&
                payment.method}
              {' - '} {payment.status}
            </Label>
          </Fragment>
        )}
      </td>
    </tr>
  )
}

const PledgeDetails = ({ pledge, ...props }) => {
  return (
    <tr {...tableStyles.emphasisedRow} {...props}>
      <td {...tableStyles.paddedCell} colSpan={2}>
          <DL>
            <DT>Donation</DT>
            <DD>{chfFormat(pledge.donation / 100)}</DD>
            {!!pledge.reason && (
              <Fragment>
                <DT>Reduced price requested</DT>
                <DD>{pledge.reason}</DD>
              </Fragment>
            )}
          </DL>
          <DL>
            <DT>Pledge Aktionen</DT>
            <DD>
              <div {...displayStyles.hFlexBox}>
                <MovePledge
                  pledge={pledge}
                  refetchQueries={({
                    data: { movePledge }
                  }) => [
                    {
                      query: GET_PLEDGES,
                      variables: { id: movePledge.id }
                    }
                  ]}
                />
                {pledge.status === 'PAID_INVESTIGATE' &&
                  <ResolvePledgeToPayment
                    pledge={pledge}
                    refetchQueries={({
                      data: { resolvePledgeToPayment }
                    }) => [
                      {
                        query: GET_PLEDGES,
                        variables: {
                          id: resolvePledgeToPayment.id
                        }
                      }
                    ]}
                  />
                }
                {pledge.status !== 'CANCELLED' &&
                  <CancelPledge
                    pledge={pledge}
                    refetchQueries={({
                      data: { cancelPledge }
                    }) => [
                      {
                        query: GET_PLEDGES,
                        variables: {
                          id: cancelPledge.id
                        }
                      }
                    ]}
                  />
                }
              </div>
            </DD>
          </DL>

        {!!pledge.payments.length && (
          <Fragment>
            {pledge.payments.map(payment => (
              <Fragment key={payment}>
                <hr />
                <PaymentDetails
                  key={`details-${payment.id}`}
                  payment={payment}
                />
                {['WAITING_FOR_REFUND', 'WAITING'].includes(payment.status) &&
                <DL>
                <DT>Payment Aktionen</DT>
                 <DD>
                   <UpdatePayment
                      key={`update-${payment.id}`}
                      payment={payment}
                      refetchQueries={() => [
                        {
                          query: GET_PLEDGES,
                          variables: {
                            id: pledge.id
                          }
                        }
                      ]}
                    />
                   {payment.status === 'WAITING' &&
                    <SendPaymentReminder
                      key={`send-reminder-${payment.id}`}
                      payment={payment}
                      refetchQueries={() => [
                        {
                          query: GET_PLEDGES,
                          variables: {
                            id: pledge.id
                          }
                        }
                      ]}
                    />
                    }
                  </DD>
                </DL>}
              </Fragment>
            ))}
          </Fragment>
        )}
      </td>
    </tr>
  )
}

const PaymentDetails = ({ payment, ...props}) => {
  return (
    <div {...props}>
      <SectionSubhead>
        {payment.method === 'STRIPE' && (
          <a
            href={`https://dashboard.stripe.com/payments/${
              payment.pspId
            }`}
            target="_blank"
          >
            STRIPE
          </a>
        )}
        {payment.method !== 'STRIPE' && payment.method}
        {' - '} {payment.status}
      </SectionSubhead>
      <div {...displayStyles.hFlexBox}>
        <div>
          <DL>
            <DT>Total</DT>
            <DD>{chfFormat(payment.total / 100)}</DD>
            <DT>HR-ID</DT>
            <DD>{payment.hrid}</DD>
          </DL>
        </div>
        {(payment.dueDate || payment.method) && (
          <div>
            <DL>
              {!!payment.dueDate && (
                <Fragment>
                  <DT>Due Date</DT>
                  <DD>
                    {displayDate(new Date(payment.dueDate))}
                  </DD>
                </Fragment>
              )}
              {payment.method === 'PAYMENTSLIP' && (
                <Fragment>
                  <DT>Paper Invoice</DT>
                  <DD>
                    {payment.paperInvoice ? 'YES' : 'NO'}
                  </DD>
                </Fragment>
              )}
            </DL>
          </div>
        )}
        {new Date(payment.dueDate) < new Date() &&
          payment.remindersSentAt &&
          payment.remindersSentAt.length > 0 && (
            <div>
              <DL>
                <DT>Verschickte Reminders</DT>
                {payment.remindersSentAt.map(date => (
                  <DD
                    key={`reminder-${date}`}
                    style={{
                      display: 'block'
                    }}
                  >
                    {' - '}
                    {displayDateTime(date)}
                  </DD>
                ))}
              </DL>
            </div>
          )}
      </div>
    </div>
  )
}

export default class Pledges extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPledgeId: null
    }
  }

  render() {
    const { userId } = this.props
    const { selectedPledgeId } = this.state
    return (
      <Query query={GET_PLEDGES} variables={{ id: userId }}>
        {({ loading, error, data }) => {
          const isInitialLoading =
            loading &&
            !(data && data.user && data.user.pledges)

          return (
            <Loader
              loading={isInitialLoading}
              error={isInitialLoading && error}
              render={() => {
                const {
                  user: { pledges }
                } = data
                return (
                  <Section>
                    <SectionTitle>Pledges</SectionTitle>
                    <table {...tableStyles.table}>
                      <colgroup>
                        <col style={{ width: '50%' }} />
                        <col style={{ width: '50%' }} />
                      </colgroup>
                      <tbody>
                        {pledges.map(p => {
                          const isActive =
                            selectedPledgeId === p.id
                          return (
                            <Fragment key={p.id}>
                              <PledgeCard
                                data-active={isActive}
                                onClick={() =>
                                  this.setState({
                                    selectedPledgeId: !isActive
                                      ? p.id
                                      : null
                                  })
                                }
                                key={`card-${p.id}`}
                                pledge={p}
                              />
                              {isActive && (
                                <PledgeDetails
                                  key={`details-${p.id}`}
                                  pledge={p}
                                />
                              )}
                            </Fragment>
                          )
                        })}
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
}
