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

export enum PaymentRequestStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  READY = 'READY',
  SHOWING = 'SHOWING',
  CANCELED = 'CANCELED',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  UNAVAILABLE = 'UNAVAILABLE',
}

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
  const [status, setStatus] = useState<PaymentRequestStatus>(
    PaymentRequestStatus.IDLE,
  )

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

  async function createPaymentRequest(): Promise<void> {
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
      setStatus(PaymentRequestStatus.UNAVAILABLE)
      return
    }
    setPaymentRequest(newPaymentRequest)
    console.debug('Payment request created')
    setStatus(PaymentRequestStatus.READY)
  }

  async function instantiatePaymentRequest(): Promise<void> {
    setStatus(PaymentRequestStatus.LOADING)
    console.debug('Instantiating payment request')
    return createPaymentRequest()
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
          setStatus(PaymentRequestStatus.SUCCEEDED)
        })
        .catch((err) => {
          console.debug('caught error', err)
          ev.complete('fail')
          setStatus(PaymentRequestStatus.FAILED)
        })
    })

    paymentRequest.on('cancel', () => {
      setStatus(PaymentRequestStatus.CANCELED)
      setPaymentRequest(null)
      handleCancel()
      createPaymentRequest()
    })

    paymentRequest.show()
    setStatus(PaymentRequestStatus.SHOWING)
  }

  return {
    status,
    instantiate: instantiatePaymentRequest,
    show,
  }
}

export default useStripePaymentRequest
