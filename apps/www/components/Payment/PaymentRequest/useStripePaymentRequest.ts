import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import {
  Stripe,
  PaymentRequest,
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  PaymentMethod,
  CanMakePaymentResult,
} from '@stripe/stripe-js'
import { loadStripe } from '../stripe'
import { makePaymentRequestOptions } from './PaymentRequestOption.helper'

type PaymentRequestStatus =
  | 'UNINITIALIZED'
  | 'LOADING'
  | 'INITIALIZED'
  | 'SHOWING'
  | 'COMPLETED'
  | 'CANCELED'
  | 'FAILED'
  | 'UNAVAILABLE'

type LeanPaymentRequestOptions = Pick<PaymentRequestOptions, 'total'>

type PaymentAvailabilitySetters = {
  setIsApplePayAvailable: Dispatch<SetStateAction<boolean>>
  setIsGooglePayAvailable: Dispatch<SetStateAction<boolean>>
}

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
  availabilitySetters: PaymentAvailabilitySetters,
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

  function updateAvailability(result: CanMakePaymentResult | null) {
    if (!availabilitySetters) {
      return
    }
    if (result) {
      availabilitySetters.setIsApplePayAvailable(result.applePay)
      availabilitySetters.setIsGooglePayAvailable(result.googlePay)
    } else {
      availabilitySetters.setIsApplePayAvailable(false)
      availabilitySetters.setIsGooglePayAvailable(false)
    }
  }

  async function instantiatePaymentRequest(): Promise<void> {
    setStatus('LOADING')
    console.debug('Instantiating payment request')
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

    const canMakePaymentResult = await newPaymentRequest.canMakePayment()
    updateAvailability(canMakePaymentResult)
    console.debug('canMakePayment', canMakePaymentResult)
    if (!canMakePaymentResult) {
      console.debug('Payment request unavailable')
      setStatus('UNAVAILABLE')
      return
    }
    setPaymentRequest(newPaymentRequest)
    console.debug('Payment request instantiated')
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
      console.debug('paymentmethod', ev)
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
