import { Component } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import Loader from '../Loader'
import { errorToString } from '../../lib/utils/errors'

import { withPay } from './Submit'
import PledgeForm from './Form'
import { gotoMerci, encodeSignInResponseQuery } from './Merci'

import { EMAIL_PAYMENT } from '../../lib/constants'

import RawHtmlTranslation from '../RawHtmlTranslation'

import { A } from '@project-r/styleguide'

// ToDo: query autoPay
const pledgeQuery = gql`
  query ($pledgeId: ID!) {
    pledge(id: $pledgeId) {
      id
      package {
        name
      }
      options {
        templateId
        amount
        optionGroup
        periods
      }
      total
      donation
      reason
      user {
        firstName
        lastName
        email
      }
      shippingAddress {
        name
        line1
        line2
        postalCode
        city
        country
      }
    }
  }
`

class PledgeReceivePayment extends Component {
  constructor(props, context) {
    super(props, context)

    const { query, t } = props

    const state = (this.state = {})
    if (query.orderID) {
      if (query.STATUS === '9' || query.STATUS === '91') {
        state.processing = true
        state.action = {
          method: 'pay',
          argument: {
            method: 'POSTFINANCECARD',
            pspPayload: query,
          },
        }
      } else {
        // https://e-payment-postfinance.v-psp.com/de/guides/user%20guides/statuses-and-errors
        // https://e-payment-postfinance.v-psp.com/de/guides/integration%20guides/possible-errors

        const errorVariables = {
          mailto: (
            <A
              key='mailto'
              href={`mailto:${EMAIL_PAYMENT}?subject=${encodeURIComponent(
                t('pledge/recievePayment/pf/mailto/subject', {
                  status: query.STATUS || '',
                }),
              )}&body=${encodeURIComponent(
                t('pledge/recievePayment/pf/mailto/body', {
                  pledgeId: query.orderID,
                  payload: JSON.stringify(query, null, 2),
                }),
              )}`}
            >
              {EMAIL_PAYMENT}
            </A>
          ),
        }

        switch (query.STATUS) {
          case '92':
            state.receiveError = (
              <RawHtmlTranslation
                error
                translationKey='pledge/recievePayment/pf/92'
                replacements={errorVariables}
              />
            )
            break
          case '93':
            state.receiveError = (
              <RawHtmlTranslation
                error
                translationKey='pledge/recievePayment/pf/retry'
                replacements={errorVariables}
              />
            )
            break
          case '0':
            state.receiveError = (
              <RawHtmlTranslation
                error
                translationKey='pledge/recievePayment/pf/invalid'
                replacements={errorVariables}
              />
            )
            break
          case '1':
            state.receiveError = (
              <RawHtmlTranslation
                error
                translationKey='pledge/recievePayment/pf/canceled'
                replacements={errorVariables}
              />
            )
            break
          case '2':
            state.receiveError = (
              <RawHtmlTranslation
                error
                translationKey='pledge/recievePayment/pf/denied'
                replacements={errorVariables}
              />
            )
            break
          default:
            state.receiveError = (
              <RawHtmlTranslation
                error
                translationKey='pledge/recievePayment/error'
                replacements={errorVariables}
              />
            )
        }
      }
    }
    if (query.item_name) {
      if (query.st === 'Completed') {
        state.processing = true
        state.action = {
          method: 'pay',
          argument: {
            method: 'PAYPAL',
            pspPayload: query,
          },
        }
      } else {
        // https://developer.paypal.com/docs/classic/ipn/integration-guide/IPNandPDTVariables/#id091EB04C0HS
        // - payment_status
        const errorVariables = {
          mailto: (
            <A
              key='mailto'
              href={`mailto:${EMAIL_PAYMENT}?subject=${encodeURIComponent(
                t('pledge/recievePayment/paypal/mailto/subject', {
                  status: query.st || '',
                }),
              )}&body=${encodeURIComponent(
                t('pledge/recievePayment/paypal/mailto/body', {
                  pledgeId: query.item_name,
                  payload: JSON.stringify(query, null, 2),
                }),
              )}`}
            >
              {EMAIL_PAYMENT}
            </A>
          ),
        }
        switch (query.st) {
          case 'Cancel':
            // see cancel_return in ./paypal.js
            state.receiveError = (
              <RawHtmlTranslation
                error
                translationKey='pledge/recievePayment/paypal/cancel'
              />
            )
            break
          case 'Denied':
          case 'Expired':
          case 'Failed':
          case 'Voided':
            state.receiveError = (
              <RawHtmlTranslation
                error
                translationKey='pledge/recievePayment/paypal/deny'
              />
            )
            break
          case 'Canceled_Reversal':
          case 'Refunded':
          case 'Reversed':
          case 'Processed':
          case 'Pending':
            state.receiveError = (
              <RawHtmlTranslation
                error
                translationKey='pledge/recievePayment/paypal/contactUs'
                replacements={errorVariables}
              />
            )
            break
          default:
            state.receiveError = (
              <RawHtmlTranslation
                error
                translationKey='pledge/recievePayment/error'
                replacements={errorVariables}
              />
            )
        }
      }
    }

    this.queryFromPledge = () => {
      const { pledge } = this.props

      const query = {
        package: pledge.package.name,
      }
      if (pledge.donation < 0) {
        query.userPrice = '1'
      }
      return query
    }
  }
  pay({ method, pspPayload }) {
    const { me, pledge, pledgeId } = this.props

    this.props
      .pay({
        pledgeId,
        method,
        pspPayload,
      })
      .then(() => {
        if (!pledge || (!pledge.user && !me)) {
          gotoMerci({
            id: pledgeId,
          })
          return
        }
        const baseQuery = {
          id: pledgeId,
        }
        if (pledge.package) {
          baseQuery.package = pledge.package.name
        }
        if (!me) {
          if (baseQuery.package === 'PROLONG') {
            gotoMerci({
              ...baseQuery,
              email: pledge.user.email,
            })
            return
          }
          this.props
            .signIn(pledge.user.email, 'pledge')
            .then(({ data: { signIn } }) =>
              gotoMerci({
                ...baseQuery,
                email: pledge.user.email,
                ...encodeSignInResponseQuery(signIn),
              }),
            )
            .catch((error) =>
              gotoMerci({
                ...baseQuery,
                email: pledge.user.email,
                signInError: errorToString(error),
              }),
            )
        } else {
          gotoMerci(baseQuery)
        }
      })
      .catch((error) => {
        this.setState(() => ({
          processing: false,
          receiveError: errorToString(error),
        }))
      })
  }
  componentDidMount() {
    // TODO: Test and re-enable psp payload purging after processing it
    // const url = {
    //   route: '/angebote',
    //   params: this.queryFromPledge()
    // }
    // Router.replaceRoute(route, params, {shallow: true})

    const { action } = this.state
    if (action) {
      this[action.method](action.argument)
    }
  }
  render() {
    const { loading, error, pledge, crowdfundingName, query, t } = this.props
    const { processing, receiveError } = this.state

    if (processing) {
      return <Loader loading message={t('pledge/submit/loading/pay')} />
    }

    return (
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const queryWithData = {
            ...query,
            ...this.queryFromPledge(),
          }

          // ToDo: access token?
          return (
            <PledgeForm
              crowdfundingName={crowdfundingName}
              receiveError={receiveError}
              query={queryWithData}
              pledge={pledge}
            />
          )
        }}
      />
    )
  }
}

const PledgeReceivePaymentById = compose(
  withT,
  graphql(pledgeQuery, {
    props: ({ data, ownProps }) => {
      let error = data.error
      if (data.pledge === null) {
        error = ownProps.t('pledge/recievePayment/noPledge', {
          pledgeId: ownProps.pledgeId,
        })
      }
      return {
        loading: data.loading,
        error,
        pledge: data.pledge,
      }
    },
  }),
  withPay,
  withMe,
)(PledgeReceivePayment)

export default PledgeReceivePaymentById
