import { Fragment, Component } from 'react'
import { Query } from '@apollo/client/react/components'
import { gql } from '@apollo/client'
import { merge } from 'glamor'
import Link from 'next/link'

import { Loader, Label, A } from '@project-r/styleguide'

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
  DD,
} from '../../Display/utils'
import { tableStyles } from '../../Tables/utils'

import MovePledge from './MovePledge'
import ResolvePledgeToPayment from './ResolvePledgeToPayment'
import CancelPledge from './CancelPledge'
import UpdatePayment from './UpdatePayment'
import UpdateAddress from './UpdateAddress'

const GET_PLEDGES = gql`
  fragment MembershipDetails on Membership {
    id
    user {
      id
    }
    pledge {
      user {
        id
        name
      }
    }
    type {
      name
    }
    active
    initialInterval
    initialPeriods
    voucherCode
    reducedPrice
    claimerName
    sequenceNumber
    createdAt
    updatedAt
  }

  query pledges($userId: String!) {
    user(slug: $userId) {
      id
      pledges {
        id
        total
        status
        reason
        donation
        memberships {
          ...MembershipDetails
        }
        shippingAddress {
          id
          name
          line1
          line2
          postalCode
          city
          country
        }
        payments {
          id
          total
          status
          method
          hrid
          invoiceUrl
          paymentslipUrl
          pspId
          paperInvoice
          dueDate
          remindersSentAt
          createdAt
        }
        package {
          name
        }
        options {
          id
          amount
          reward {
            ... on Goodie {
              name
            }
            ... on MembershipType {
              name
            }
          }
          membership {
            ...MembershipDetails
          }
          price
        }
        createdAt
      }
    }
  }
`

const PledgeCard = ({ pledge, ...props }) => {
  const payment = pledge.payments[0]
  const membership = pledge.memberships[0]
  const { shippingAddress } = pledge
  return (
    <tr {...merge(tableStyles.row, tableStyles.selectableRow)} {...props}>
      <td {...tableStyles.paddedCell}>
        {pledge.package.name.split('_').join(' ')}
        {membership && ` #${membership.sequenceNumber}`}
        {' - '}
        {pledge.status}
        <br />
        <Label>Erstellt am {displayDateTime(pledge.createdAt)}</Label>
        <br />
        <Label>ID: {pledge.id}</Label>
        {shippingAddress && (
          <>
            <br />
            <Label>
              Lieferadresse: {shippingAddress.name}, {shippingAddress.city}
            </Label>
          </>
        )}
      </td>
      <td {...tableStyles.paddedCell}>
        {chfFormat(pledge.total / 100)}
        {payment && (
          <Fragment>
            <br />
            <Label>
              {payment.method === 'STRIPE' && (
                <A
                  {...tableStyles.link}
                  href={`https://dashboard.stripe.com/payments/${payment.pspId}`}
                  target='_blank'
                >
                  STRIPE
                </A>
              )}
              {payment.method !== 'STRIPE' && payment.method}
              {' - '} {payment.status}
            </Label>
          </Fragment>
        )}
      </td>
    </tr>
  )
}

const PledgeDetails = ({ userId, pledge, ...props }) => {
  const memberships = pledge.memberships
    .concat(pledge.options.map((option) => option.membership))
    .filter(Boolean)

  const { shippingAddress } = pledge

  return (
    <tr {...tableStyles.emphasisedRow} {...props}>
      <td {...tableStyles.paddedCell} colSpan={2}>
        <DL>
          {shippingAddress && (
            <>
              <DT>Lieferadresse</DT>
              <DD>{shippingAddress.name}</DD>
              <DD>{shippingAddress.line1}</DD>
              {shippingAddress.line2 && <DD>{shippingAddress.line2}</DD>}
              <DD>
                {[shippingAddress.postalCode, shippingAddress.city]
                  .filter(Boolean)
                  .join(' ')}
              </DD>
              {shippingAddress.country && <DD>{shippingAddress.country}</DD>}
              <DD>
                <UpdateAddress address={shippingAddress} />
              </DD>
            </>
          )}
          <DT>Donation</DT>
          <DD>{chfFormat(pledge.donation / 100)}</DD>
          {!!pledge.reason && (
            <Fragment>
              <DT>Reduced price requested</DT>
              <DD>{pledge.reason}</DD>
            </Fragment>
          )}
          <DT>Options</DT>
          <DD>
            {pledge.options
              .filter((option) => option.amount > 0)
              .map(
                (option) =>
                  option.reward && (
                    <Fragment>
                      {option.amount} x{' '}
                      {option.reward ? `«${option.reward.name}»` : ''} à{' '}
                      {chfFormat(option.price / 100)}
                      <br />
                    </Fragment>
                  ),
              )}
          </DD>
        </DL>
        <DL>
          <DT>Pledge Aktionen</DT>
          <DD>
            <MovePledge
              pledge={pledge}
              refetchQueries={() => [
                {
                  query: GET_PLEDGES,
                  variables: { userId },
                },
              ]}
            />
            {pledge.status === 'PAID_INVESTIGATE' && (
              <ResolvePledgeToPayment
                pledge={pledge}
                refetchQueries={() => [
                  {
                    query: GET_PLEDGES,
                    variables: { userId },
                  },
                ]}
              />
            )}
            {pledge.status !== 'CANCELLED' && (
              <CancelPledge
                pledge={pledge}
                refetchQueries={() => [
                  {
                    query: GET_PLEDGES,
                    variables: { userId },
                  },
                ]}
              />
            )}
          </DD>
        </DL>

        {!!pledge.payments.length && (
          <Fragment>
            {pledge.payments.map((payment) => (
              <Fragment key={payment}>
                <hr />
                <PaymentDetails
                  key={`details-${payment.id}`}
                  payment={payment}
                />
                {['WAITING_FOR_REFUND', 'WAITING'].includes(payment.status) && (
                  <DL>
                    <DT>Payment Aktionen</DT>
                    <DD>
                      <UpdatePayment
                        key={`update-${payment.id}`}
                        payment={payment}
                        refetchQueries={() => [
                          {
                            query: GET_PLEDGES,
                            variables: { userId },
                          },
                        ]}
                      />
                    </DD>
                  </DL>
                )}
              </Fragment>
            ))}
          </Fragment>
        )}

        {!!memberships.length &&
          memberships.map((membership) => (
            <Fragment key={membership}>
              <hr />
              <MembershipDetails
                key={`details-${membership.id}`}
                membership={membership}
                user={pledge.user}
              />
            </Fragment>
          ))}
      </td>
    </tr>
  )
}

const PaymentDetails = ({ payment, ...props }) => {
  const hridUrl = payment.invoiceUrl || payment.paymentslipUrl

  return (
    <div {...props}>
      <SectionSubhead>
        {payment.method === 'STRIPE' && (
          <A
            href={`https://dashboard.stripe.com/payments/${payment.pspId}`}
            target='_blank'
          >
            STRIPE
          </A>
        )}
        {payment.method !== 'STRIPE' && payment.method}
        {' - '} {payment.status}
      </SectionSubhead>
      <Label>Erstellt am {displayDateTime(new Date(payment.createdAt))}</Label>
      <br />
      <Label>ID: {payment.id}</Label>
      <div {...displayStyles.hFlexBox}>
        <div>
          <DL>
            <DT>Total</DT>
            <DD>{chfFormat(payment.total / 100)}</DD>
            <DT>HR-ID</DT>
            <DD>
              {hridUrl ? (
                <A href={hridUrl} target='_blank'>
                  {payment.hrid}
                </A>
              ) : (
                payment.hrid
              )}
            </DD>
          </DL>
        </div>
        {(payment.dueDate || payment.method) && (
          <div>
            <DL>
              {!!payment.dueDate && (
                <Fragment>
                  <DT>Due Date</DT>
                  <DD>{displayDate(new Date(payment.dueDate))}</DD>
                </Fragment>
              )}
              {payment.method === 'PAYMENTSLIP' && (
                <Fragment>
                  <DT>Paper Invoice</DT>
                  <DD>{payment.paperInvoice ? 'YES' : 'NO'}</DD>
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
                {payment.remindersSentAt.map((date) => (
                  <DD
                    key={`reminder-${date}`}
                    style={{
                      display: 'block',
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

const MembershipDetails = ({ membership, ...props }) => {
  return (
    <div {...props}>
      <SectionSubhead>
        {membership.type.name.split('_').join(' ')} #{membership.sequenceNumber}{' '}
      </SectionSubhead>
      <Label>ID: {membership.id}</Label>
      {!!membership.voucherCode && (
        <DL>
          <DT>Voucher Code</DT>
          <DD>{membership.voucherCode}</DD>
        </DL>
      )}
      {!!membership.claimerName && (
        <DL>
          <DT>eingelöst von</DT>
          <DD>
            <Link href={`/users/${membership.user.id}`} passHref legacyBehavior>
              <A>{membership.claimerName}</A>
            </Link>
          </DD>
        </DL>
      )}
    </div>
  )
}

export default class Pledges extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPledgeId: null,
    }
  }

  render() {
    const { userId } = this.props
    const { selectedPledgeId } = this.state
    return (
      <Query query={GET_PLEDGES} variables={{ userId }}>
        {({ loading, error, data }) => {
          const isInitialLoading =
            loading && !(data && data.user && data.user.pledges)

          return (
            <Loader
              loading={isInitialLoading}
              error={isInitialLoading && error}
              render={() => {
                const {
                  user: { pledges },
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
                        {pledges.map((p) => {
                          const isActive = selectedPledgeId === p.id
                          return (
                            <Fragment key={p.id}>
                              <PledgeCard
                                data-active={isActive}
                                onClick={() =>
                                  this.setState({
                                    selectedPledgeId: !isActive ? p.id : null,
                                  })
                                }
                                key={`card-${p.id}`}
                                pledge={p}
                              />
                              {isActive && (
                                <PledgeDetails
                                  key={`details-${p.id}`}
                                  userId={userId}
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
