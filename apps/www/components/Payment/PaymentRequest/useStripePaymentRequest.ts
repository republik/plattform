import { useState } from 'react'
import {
  Stripe,
  PaymentRequest,
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  PaymentMethod,
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
type PaymentCanceledHandler = () => void

interface PaymentRequestValues {
  initialized: boolean
  initialize: () => Promise<void>
  show: (
    handlePledge: PledgeHandler,
    handleCancel: PaymentCanceledHandler,
  ) => void
  paymentMethod: PaymentMethod | null
}

function useStripePaymentRequest(
  options: LeanPaymentRequestOptions,
): PaymentRequestValues {
  const [stripe, setStripe] = useState<Stripe>(null)
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)

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

    setPaymentRequest(newPaymentRequest)
  }

  function show(
    handlePledge: PledgeHandler,
    handleCancel: PaymentCanceledHandler,
  ) {
    if (!paymentRequest) {
      alert('Payment Request not initialized')
      return
    }

    paymentRequest.on('paymentmethod', (ev) => {
      setPaymentMethod(ev.paymentMethod)
      handlePledge(ev)
        .then(() => {
          ev.complete('success')
          console.debug('Payment successful')
        })
        .catch((err) => {
          ev.complete('fail')
          console.debug('Payment failed', err)
          handleCancel()
        })
        .finally(() => {
          console.debug('Resetting payment request')
          setPaymentRequest(null)
        })
    })

    paymentRequest.on('cancel', () => {
      console.debug('Payment request cancelled')
      handleCancel()
      setPaymentRequest(null)
    })

    paymentRequest.show()
  }

  return {
    initialized: !!paymentRequest,
    initialize,
    show,
    paymentMethod,
  }
}

export default useStripePaymentRequest
