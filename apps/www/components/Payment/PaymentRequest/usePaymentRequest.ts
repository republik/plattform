import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
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

type LeanPaymentRequestOptions = Pick<PaymentRequestOptions, 'total'>

type PaymentHandler = (event: PaymentRequestPaymentMethodEvent) => Promise<void>
type PaymentCanceledHandler = () => void

type PaymentRequestParameterObject = {
  options: LeanPaymentRequestOptions
  selectedPaymentMethod: string | null
  setSelectedPaymentMethod: Dispatch<SetStateAction<string | null>>
}

interface PaymentRequestValues {
  loading: boolean
  show: (
    handlePayment: PaymentHandler,
    handleCancel: PaymentCanceledHandler,
  ) => void
  usedWallet: WalletPaymentMethod
  setupError: string
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
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [setupError, setSetupError] = useState<string>(null)

  const [usedWallet, setUsedWallet] = useState<WalletPaymentMethod>(null)
  const [lastOptions, setLastOptions] =
    useState<LeanPaymentRequestOptions>(null)

  const { t } = useTranslation()

  const initializePaymentRequest = useCallback(
    async (wallet: WalletPaymentMethod): Promise<void> => {
      setLoading(true)
      setPaymentRequest(null)
      setSetupError(null)
      // Track used options to prevent useless re-initializations
      setLastOptions(options)
      // Track the wallet in case the previous payment request was initialized with a different one
      setUsedWallet(wallet)

      const prOptions = makePaymentRequestOptions(
        options,
        getPaymentRequestWalletValue(wallet),
      )

      let newPaymentRequest
      let canMakePaymentResult
      try {
        const stripe = await loadStripe()
        newPaymentRequest = await stripe.paymentRequest(prOptions)
        canMakePaymentResult = await newPaymentRequest.canMakePayment()
        // eslint-disable-next-line no-empty
      } catch (e) {}

      const initializationStage = paymentRequest
        ? 're-initialization'
        : 'initialization'

      if (!canMakePaymentResult) {
        const failureCause =
          newPaymentRequest && canMakePaymentResult === null
            ? 'unavailable'
            : 'exception'

        setSelectedPaymentMethod('STRIPE')
        setSetupError(
          t(`account/pledges/payment/methods/wallet/${failureCause}`, {
            wallet: t(`account/pledges/payment/method/${wallet}`),
          }),
        )
        trackEvent([
          'payment-request',
          `${initializationStage} ${failureCause}`,
          wallet,
          options.total.amount / 100,
        ])
      } else {
        setPaymentRequest(newPaymentRequest)
        trackEvent([
          'payment-request',
          `${initializationStage} successful`,
          wallet,
          options.total.amount / 100,
        ])
      }
      setLoading(false)
    },
    [options, paymentRequest, setSelectedPaymentMethod, t],
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
          trackEvent([
            'payment-request',
            'payment succeeded',
            usedWallet,
            options.total.amount / 100,
          ])
        })
        .catch(() => {
          ev.complete('fail')
          trackEvent([
            'payment-request',
            'payment failed',
            usedWallet,
            options.total.amount / 100,
          ])
        })
    })

    paymentRequest.on('cancel', () => {
      setPaymentRequest(null)
      handleCancel()

      // The result of the following reinitialization is ignored
      // since we can only get to this point if it was successful before
      initializePaymentRequest(usedWallet)
    })

    paymentRequest.show()
  }

  useEffect(() => {
    const isWallet = selectedPaymentMethod?.startsWith('STRIPE-WALLET')
    if (!isWallet) {
      if (setupError && !selectedPaymentMethod?.startsWith('STRIPE')) {
        setSetupError(null)
      }
      return
    }

    if (loading) {
      return
    }

    // Handle (re-)initialization of the payment request or switching payment method if unavailable
    if (
      !paymentRequest ||
      usedWallet !== selectedPaymentMethod ||
      JSON.stringify(lastOptions) !== JSON.stringify(options)
    ) {
      initializePaymentRequest(selectedPaymentMethod as WalletPaymentMethod)
    }
  }, [
    selectedPaymentMethod,
    setupError,
    loading,
    paymentRequest,
    usedWallet,
    lastOptions,
    options,
    initializePaymentRequest,
  ])

  return {
    loading,
    show,
    usedWallet,
    setupError,
  }
}

export default usePaymentRequest
