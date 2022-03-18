import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  Stripe,
  PaymentRequest,
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  PaymentRequestWallet,
} from '@stripe/stripe-js'
import { loadStripe } from '../stripe'
import { makePaymentRequestOptions } from './PaymentRequestOption.helper'
import { trackEvent } from '../../../lib/matomo'
import { useTranslation } from '../../../lib/withT'

export enum WalletPaymentMethod {
  APPLE_PAY = 'STRIPE-WALLET-APPLE-PAY',
  GOOGLE_PAY = 'STRIPE-WALLET-GOOGLE-PAY',
}

function getPaymentRequestWalletValue(
  wallet: WalletPaymentMethod,
): PaymentRequestWallet {
  switch (wallet) {
    case WalletPaymentMethod.APPLE_PAY:
      return 'applePay'
    case WalletPaymentMethod.GOOGLE_PAY:
      return 'googlePay'
    default:
      return null
  }
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

type PaymentHandler = (event: PaymentRequestPaymentMethodEvent) => Promise<void>
type PaymentCanceledHandler = () => void

type PaymentRequestErrors = {
  walletError: string | null
  stripeError: string | null
}

type PaymentRequestParameterObject = {
  options: LeanPaymentRequestOptions
  selectedPaymentMethod: string | null
  setSelectedPaymentMethod: Dispatch<SetStateAction<string | null>>
}

interface PaymentRequestValues {
  status: PaymentRequestStatus
  show: (
    handlePayment: PaymentHandler,
    handleCancel: PaymentCanceledHandler,
  ) => void
  usedWallet: WalletPaymentMethod
  errors: {
    walletError: string | null
    stripeError: string | null
  }
}

/**
 * Hook used to wrap a Stripe.js payment-request object
 * Upon the first initialization stripe is lazy-loaded.
 *
 * @param selectedPaymentMethod
 * @param setSelectedPaymentMethod
 * @param options used to initialize the payment request
 */
function usePaymentRequest({
  selectedPaymentMethod,
  setSelectedPaymentMethod: setSelectedPaymentMethod,
  options,
}: PaymentRequestParameterObject): PaymentRequestValues {
  const [stripe, setStripe] = useState<Stripe>(null)
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>(null)
  const [status, setStatus] = useState<PaymentRequestStatus>(
    PaymentRequestStatus.IDLE,
  )
  const [errors, setErrors] = useState<PaymentRequestErrors>({
    walletError: null,
    stripeError: null,
  })

  const [usedWallet, setUsedWallet] = useState<WalletPaymentMethod>(null)
  const [lastOptions, setLastOptions] =
    useState<LeanPaymentRequestOptions>(null)

  const { t } = useTranslation()

  const initializePaymentRequest = useCallback(
    async (wallet: WalletPaymentMethod): Promise<PaymentRequestStatus> => {
      setStatus(PaymentRequestStatus.LOADING)
      setErrors({
        walletError: null,
        stripeError: null,
      })
      let stripePromise = stripe
      if (!stripe) {
        const globalStripePromise = await loadStripe()
        setStripe(globalStripePromise)
        stripePromise = globalStripePromise
      }

      const newPaymentRequest = await stripePromise.paymentRequest(
        makePaymentRequestOptions(
          options,
          getPaymentRequestWalletValue(wallet),
        ),
      )

      // Track used options to prevent useless re-initializations
      setLastOptions(options)
      // Track the wallet in case the previous payment request was initialized with a different one
      setUsedWallet(wallet)

      const canMakePaymentResult = await newPaymentRequest.canMakePayment()

      const initializationStage = paymentRequest
        ? 're-initialization'
        : 'initialization'

      if (!canMakePaymentResult) {
        setStatus(PaymentRequestStatus.UNAVAILABLE)
        trackEvent([
          'payment-request',
          `${initializationStage} failed`,
          wallet,
          options.total.amount / 100,
        ])
        return PaymentRequestStatus.UNAVAILABLE
      }

      setPaymentRequest(newPaymentRequest)
      setStatus(PaymentRequestStatus.READY)
      trackEvent([
        'payment-request',
        `${initializationStage} successful`,
        wallet,
        options.total.amount / 100,
      ])
      return PaymentRequestStatus.READY
    },
    [options, paymentRequest, stripe],
  )

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
          setStatus(PaymentRequestStatus.SUCCEEDED)
          trackEvent([
            'payment-request',
            'payment succeeded',
            usedWallet,
            options.total.amount / 100,
          ])
        })
        .catch(() => {
          ev.complete('fail')
          setStatus(PaymentRequestStatus.FAILED)
          trackEvent([
            'payment-request',
            'payment failed',
            usedWallet,
            options.total.amount / 100,
          ])
        })
    })

    paymentRequest.on('cancel', () => {
      setStatus(PaymentRequestStatus.CANCELED)
      setPaymentRequest(null)
      handleCancel()

      // The result of the following reinitialization is ignored
      // since we can only get to this point if it was successful before
      initializePaymentRequest(usedWallet)
    })

    paymentRequest.show()
    setStatus(PaymentRequestStatus.SHOWING)
  }

  useEffect(() => {
    const selectPMIsStripeWallet =
      selectedPaymentMethod && selectedPaymentMethod.startsWith('STRIPE-WALLET')

    const isUninitialized =
      selectPMIsStripeWallet &&
      (status === PaymentRequestStatus.IDLE ||
        status === PaymentRequestStatus.UNAVAILABLE)

    const initializedWalletIsOutdated =
      selectPMIsStripeWallet && usedWallet !== selectedPaymentMethod

    const optionsUsedToInitializeHaveChanged =
      selectPMIsStripeWallet &&
      JSON.stringify(lastOptions) !== JSON.stringify(options)

    if (status === PaymentRequestStatus.LOADING) {
      return
    }
    // Handle (re-)initialization of the payment request or switching payment method if unavailable
    if (
      isUninitialized ||
      initializedWalletIsOutdated ||
      optionsUsedToInitializeHaveChanged
    ) {
      initializePaymentRequest(selectedPaymentMethod as WalletPaymentMethod)
        .then((status) => {
          if (status === PaymentRequestStatus.UNAVAILABLE) {
            setSelectedPaymentMethod('STRIPE')
            setErrors({
              stripeError: t(
                'account/pledges/payment/methods/wallet-unavailable',
                {
                  wallet: t(
                    'account/pledges/payment/method/' + selectedPaymentMethod,
                  ),
                },
              ),
              walletError: t('account/pledges/payment/methods/unavailable'),
            })
          }
        })
        .catch(() => {
          setStatus(PaymentRequestStatus.UNAVAILABLE)
          setErrors({
            stripeError: null,
            walletError: t(
              'account/pledges/payment/methods/initialization/error',
            ),
          })
        })
    }
  }, [
    errors.walletError,
    initializePaymentRequest,
    lastOptions,
    options,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    status,
    t,
    usedWallet,
  ])

  return {
    status,
    show,
    usedWallet,
    errors,
  }
}

export default usePaymentRequest
