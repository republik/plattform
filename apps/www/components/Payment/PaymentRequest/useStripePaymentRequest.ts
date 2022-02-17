import { useState } from 'react'
import {
  Stripe,
  PaymentRequest,
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
} from '@stripe/stripe-js'
import { loadStripe } from '../stripe'

type LeanPaymentRequestOptions = Pick<PaymentRequestOptions, 'total'>

function makeOptions(
  leanOptions: LeanPaymentRequestOptions,
): PaymentRequestOptions {
  return {
    ...leanOptions,
    disableWallets: ['browserCard'], // Only accept Apple- & Google Pay
    country: 'CH',
    currency: 'chf',
    requestPayerEmail: true,
    requestPayerName: true,
  }
}

type PledgeHandler = (event: PaymentRequestPaymentMethodEvent) => Promise<void>

interface PaymentRequestValues {
  initialized: boolean
  initialize: () => Promise<void>
  show: (pledgeHandler: PledgeHandler) => void
}

function useStripePaymentRequest(
  options: LeanPaymentRequestOptions,
): PaymentRequestValues {
  const [stripe, setStripe] = useState<Stripe>(null)
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>(null)
  // Keep track of the options last used to initialize the PaymentRequest
  const [lastOptions, setLastOptions] =
    useState<LeanPaymentRequestOptions>(null)

  async function initialize() {
    let stripePromise = stripe
    if (!stripe) {
      const globalStripePromise = await loadStripe()
      setStripe(globalStripePromise)
      stripePromise = globalStripePromise
    }

    const newPaymentRequest = await stripePromise.paymentRequest(
      makeOptions(options),
    )

    const newPaymentRequestPromise = newPaymentRequest.canMakePayment()
    if (!newPaymentRequestPromise) {
      alert('This browser does not support Payment Request')
      return
    }

    setLastOptions(options)
    setPaymentRequest(newPaymentRequest)
  }

  async function show(handlePayment: PledgeHandler) {
    if (!paymentRequest) {
      alert('Payment Request not initialized')
      return
    }

    paymentRequest.on('paymentmethod', (ev) => {
      handlePayment(ev)
        .then(() => {
          ev.complete('success')
          console.debug('Payment successful')
        })
        .catch((err) => {
          ev.complete('fail')
          console.debug('Payment failed', err)
        })
        .finally(() => {
          console.debug('Resetting payment request')
          setPaymentRequest(null)
        })
    })

    paymentRequest.show()
  }

  return {
    initialized: !!paymentRequest,
    initialize,
    show,
  }
}

export default useStripePaymentRequest
