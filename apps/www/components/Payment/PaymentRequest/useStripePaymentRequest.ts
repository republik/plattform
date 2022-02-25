import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
  Stripe,
  PaymentRequest,
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  CanMakePaymentResult,
} from '@stripe/stripe-js'
import { loadStripe } from '../stripe'
import { makePaymentRequestOptions } from './PaymentRequestOption.helper'

export enum WalletPaymentMethods {
  APPLE_PAY = 'STRIPE-WALLET-APPLE-PAY',
  GOOGLE_PAY = 'STRIPE-WALLET-GOOGLE-PAY',
}

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
  instantiate: () => Promise<PaymentRequestStatus>
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

  async function createPaymentRequest(): Promise<PaymentRequestStatus> {
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

    if (!canMakePaymentResult) {
      setStatus(PaymentRequestStatus.UNAVAILABLE)
      return PaymentRequestStatus.UNAVAILABLE
    }

    setPaymentRequest(newPaymentRequest)
    setStatus(PaymentRequestStatus.READY)
    return PaymentRequestStatus.READY
  }

  async function instantiatePaymentRequest(): Promise<PaymentRequestStatus> {
    setStatus(PaymentRequestStatus.LOADING)
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
      handlePayment(ev)
        .then(() => {
          console.debug('PaymentRequest success-callback')
          ev.complete('success')
          setStatus(PaymentRequestStatus.SUCCEEDED)
        })
        .catch((err) => {
          console.debug('PaymentRequest error-callback', err)
          ev.complete('fail')
          setStatus(PaymentRequestStatus.FAILED)
        })
    })

    paymentRequest.on('cancel', () => {
      console.debug('PaymentRequest cancel-callback')
      setStatus(PaymentRequestStatus.CANCELED)
      setPaymentRequest(null)
      handleCancel()

      // The result of the following reinitialization is ignored
      // since we can only get to this point if it was successful before
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
