import { useEffect, useMemo, useState } from 'react'
import {
  Stripe,
  PaymentRequest,
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  PaymentMethod,
} from '@stripe/stripe-js'
import { loadStripe } from '../stripe'
import { makePaymentRequestOptions } from './PaymentRequestOption.helper'

type PaymentRequestStatus =
  | 'UNINITIALIZED'
  | 'INITIALIZED'
  | 'SHOWING'
  | 'COMPLETED'
  | 'CANCELED'
  | 'FAILED'
  | 'UNAVAILABLE'

type LeanPaymentRequestOptions = Pick<PaymentRequestOptions, 'total'>

type PaymentHandler = (event: PaymentRequestPaymentMethodEvent) => Promise<void>
type PaymentCanceledHandler = () => void

interface PaymentRequestValues {
  status: PaymentRequestStatus
  instantiate: () => Promise<void>
  show: (
    handlePayment: PaymentHandler,
    handleCancel: PaymentCanceledHandler,
  ) => void
}

/**
 * Hook used to wrap a Stripe.js payment-request object
 * Upon the first initialization stripe is lazy-loaded.
 *
 * @param options used to initialize the payment request
 */
function useStripePaymentRequest(
  options: LeanPaymentRequestOptions,
): PaymentRequestValues {
  const [stripe, setStripe] = useState<Stripe>(null)
  const [lastOptions, setLastOptions] =
    useState<LeanPaymentRequestOptions>(null)

  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>(null)
  const [status, setStatus] = useState<PaymentRequestStatus>('UNINITIALIZED')

  useEffect(() => {
    // In case the input options have changed create a new PaymentRequest
    if (
      paymentRequest &&
      JSON.stringify(lastOptions) !== JSON.stringify(options)
    ) {
      setLastOptions(options)
      instantiatePaymentRequest()
    }
  }, [paymentRequest, lastOptions, options])

  async function instantiatePaymentRequest(): Promise<void> {
    let stripePromise = stripe
    if (!stripe) {
      const globalStripePromise = await loadStripe()
      setStripe(globalStripePromise)
      stripePromise = globalStripePromise
    }

    const newPaymentRequest = await stripePromise.paymentRequest(
      makePaymentRequestOptions(options),
    )
    setLastOptions(options)

    const newPaymentRequestPromise = newPaymentRequest.canMakePayment()
    if (!newPaymentRequestPromise) {
      setStatus('UNAVAILABLE')
      return
    }
    setPaymentRequest(newPaymentRequest)
    setStatus('INITIALIZED')
  }

  function show(
    handlePayment: PaymentHandler,
    handleCancel: PaymentCanceledHandler,
  ) {
    if (!paymentRequest || paymentRequest.isShowing()) {
      return
    }

    paymentRequest.on('paymentmethod', (ev) => {
      handlePayment(ev)
        .then(() => {
          ev.complete('success')
          setStatus('COMPLETED')
        })
        .catch((err) => {
          ev.complete('fail')
          setStatus('FAILED')
          handleCancel()
          instantiatePaymentRequest()
        })
    })

    paymentRequest.on('cancel', () => {
      setStatus('CANCELED')
      setPaymentRequest(null)
      handleCancel()
      instantiatePaymentRequest()
    })

    paymentRequest.show()
    setStatus('SHOWING')
  }

  return {
    status,
    instantiate: instantiatePaymentRequest,
    show,
  }
}

export default useStripePaymentRequest
