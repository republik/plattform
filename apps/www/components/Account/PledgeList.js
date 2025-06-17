import { Component, Fragment } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { A } from '@project-r/styleguide'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import { timeFormat, chfFormat } from '../../lib/utils/format'
import List, { Item } from '../List'
import { Item as AccountItem } from './Elements'
import GiveMemberships from './Memberships/Give'
import { MyBelongingsDocument } from '#graphql/republik-api/__generated__/gql/graphql'

const dayFormat = timeFormat('%-d. %B %Y')

class PledgeList extends Component {
  render() {
    const { pledges, t, highlightId, me } = this.props

    return (
      <Fragment>
        {pledges.map((pledge) => {
          const options = pledge.options.filter(
            (option) => option.amount && option.minAmount !== option.maxAmount,
          )
          const createdAt = new Date(pledge.createdAt)

          return (
            <AccountItem
              key={pledge.id}
              highlighted={highlightId === pledge.id}
              title={t(`package/${pledge.package.name}/title`)}
              createdAt={createdAt}
            >
              <List>
                {!!options.length &&
                  options.map((option, i) => {
                    const { membership, additionalPeriods } = option
                    const isAboGive = membership && membership.user.id !== me.id
                    const endDate =
                      additionalPeriods &&
                      additionalPeriods.length &&
                      additionalPeriods[additionalPeriods.length - 1].endDate

                    return (
                      <Item key={`option-${i}`}>
                        {option.maxAmount > 1 ? `${option.amount} ` : ''}
                        {t.first(
                          [
                            isAboGive &&
                              `pledge/option/${pledge.package.name}/${option.reward.name}/label/give`,
                            isAboGive &&
                              `option/${option.reward.name}/label/give`,
                            `pledge/option/${pledge.package.name}/${option.reward.name}/label/${option.amount}`,
                            `pledge/option/${pledge.package.name}/${option.reward.name}/label/other`,
                            `pledge/option/${pledge.package.name}/${option.reward.name}/label`,
                            option.accessGranted &&
                              `option/${pledge.package.name}/${option.reward.name}/accessGranted/label/${option.amount}`,
                            option.accessGranted &&
                              `option/${pledge.package.name}/${option.reward.name}/accessGranted/label/other`,
                            option.accessGranted &&
                              `option/${pledge.package.name}/${option.reward.name}/accessGranted/label`,
                            option.accessGranted &&
                              `option/${option.reward.name}/accessGranted/label/${option.amount}`,
                            option.accessGranted &&
                              `option/${option.reward.name}/accessGranted/label/other`,
                            option.accessGranted &&
                              `option/${option.reward.name}/accessGranted/label`,
                            `option/${option.reward.name}/label/${option.amount}`,
                            `option/${option.reward.name}/label/other`,
                            `option/${option.reward.name}/label`,
                          ].filter(Boolean),
                          {
                            count: option.amount,
                            name:
                              option.membership && option.membership.user.name,
                            sequenceNumber:
                              option.membership &&
                              option.membership.sequenceNumber,
                            endDateSuffix: endDate
                              ? t('option/suffix/endDate', {
                                  formattedEndDate: dayFormat(
                                    new Date(endDate),
                                  ),
                                })
                              : '',
                            periods:
                              option.reward &&
                              option.reward.interval &&
                              t.pluralize(
                                `option/${option.reward.name}/interval/${option.reward.interval}/periods`,
                                { count: option.periods },
                              ),
                          },
                        )}
                      </Item>
                    )
                  })}
                {pledge.payments.map((payment, i) => (
                  <Fragment key={`payment-${i}`}>
                    <Item>
                      {t(
                        `account/pledges/payment/status/generic/${payment.status}`,
                        {
                          formattedTotal: chfFormat(payment.total / 100),
                          dateSuffix:
                            pledge.payments.length === 1
                              ? ''
                              : t(
                                  'account/pledges/payment/status/generic/PAID/dateSuffix',
                                  {
                                    createdAt: dayFormat(
                                      new Date(payment.createdAt),
                                    ),
                                  },
                                ),
                          method: t(
                            `account/pledges/payment/method/${payment.method}`,
                          ),
                        },
                      )}
                    </Item>
                    {payment.paymentslipUrl && (
                      <>
                        <Item>
                          <A href={payment.paymentslipUrl} target='_blank'>
                            {t('account/pledges/payment/paymentslipLink')}
                          </A>
                        </Item>
                        <Item>
                          {t('account/pledges/payment/paymentslipHint')}
                        </Item>
                      </>
                    )}
                  </Fragment>
                ))}
              </List>
              <GiveMemberships
                memberships={pledge.memberships}
                pkg={pledge.package}
              />
            </AccountItem>
          )
        })}
      </Fragment>
    )
  }
}

export default compose(
  withT,
  withMe,
  graphql(MyBelongingsDocument, {
    props: ({ data }) => {
      return {
        loading: data.loading,
        error: data.error,
        pledges: (
          (!data.loading && !data.error && data.me && data.me.pledges) ||
          []
        ).filter((pledge) => pledge.status !== 'DRAFT'),
      }
    },
  }),
)(PledgeList)
