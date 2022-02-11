import {
  Elements,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { useIsApplePayAvailable } from './Form/ApplePay'
import React, { useEffect, useState } from 'react'
import { PaymentRequest, Stripe } from '@stripe/stripe-js'
import { loadStripe } from './stripe'

type Props = Partial<{
  submitPledge: (...args: unknown[]) => Promise<unknown>
  payPledge: (...args: unknown[]) => Promise<unknown>
}>

const PaymentRequestButton = () => {
  const stripe = useStripe()
  const elements = useElements()

  const isApplePayAvailable = useIsApplePayAvailable()
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null,
  )

  useEffect(() => {
    if (!stripe || !elements) {
      return
    }

    /*const res = submitPledge()
      .then((res) => {
        console.debug('res', res)
        return
      })
      .catch((err) => console.debug('err', err))
    return*/

    const stripePaymentRequest = stripe.paymentRequest({
      country: 'CH',
      currency: 'chf',
      total: {
        label: 'Total',
        amount: 100,
        pending: false,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
      shippingOptions: [
        {
          amount: 800,
          label: 'Standard shipping',
          id: 'standard',
          detail: 'Delivery within 5 days',
        },
        {
          amount: 1600,
          label: 'Express shipping',
          id: 'express',
          detail: 'Delivery within 1 day',
        },
      ],
    })

    stripePaymentRequest.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(stripePaymentRequest)
      }
    })
  }, [stripe, elements])

  if (!isApplePayAvailable) {
    return <p>Apple Pay is not available</p>
  }

  return (
    <div>
      <p>Apple Pay available</p>
      {paymentRequest && (
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
          }}
        />
      )}
    </div>
  )
}

export default PaymentRequestButton

export const ApplePayWrapper = (props: Props) => {
  const [stripeObj, setStripeObj] = useState<Stripe | null>(null)

  useEffect(() => {
    loadStripe().then(setStripeObj)
  }, [])

  if (!stripeObj) {
    return <p>Loading...</p>
  }

  return (
    <Elements stripe={stripeObj}>
      <PaymentRequestButton {...props} />
    </Elements>
  )
}
