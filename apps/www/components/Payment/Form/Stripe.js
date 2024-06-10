import { forwardRef, useEffect, useState } from 'react'
import { css } from 'glamor'

import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'

import { fontStyles, useColorContext, Interaction } from '@project-r/styleguide'

import { loadStripe } from '../stripe'
import StripeField from './StripeField'
import { useTheme } from '../../ColorScheme/ThemeProvider'

const styles = {
  container: css({
    margin: '10px 0',
    lineHeight: 0,
  }),
}

const fieldElements = [
  { key: 'cardNumber', Element: CardNumberElement },
  { key: 'expiry', Element: CardExpiryElement },
  { key: 'cvc', Element: CardCvcElement },
]

const Form = forwardRef(
  (
    {
      onChange,
      errors,
      dirty,
      t,
      unlockFieldKey,
      setUnlockFieldKey,
      stripeLoadState,
      setStripeLoadState,
      retryLoadStripe,
    },
    ref,
  ) => {
    const stripe = useStripe()
    const elements = useElements()
    const { resolvedTheme: theme } = useTheme()

    const style = {
      base: {
        ...fontStyles.sansSerifRegular,
        fontSize: '22px',
        color: theme === 'dark' ? '#fff' : '#282828',
        lineHeight: '40px',
        '::placeholder': {
          color: theme === 'dark' ? '#6E6E6E' : '#949494',
        },
      },
      invalid: {
        color: theme === 'dark' ? '#F0400A' : '#9F2500',
      },
    }

    ref({
      createPaymentMethod: () => {
        if (!stripe || !elements) {
          return
        }
        return new Promise((resolve, reject) => {
          stripe
            .createPaymentMethod({
              type: 'card',
              card: elements.getElement(CardNumberElement),
            })
            .then((result) => {
              if (result.error) {
                reject(result.error.message)
              } else {
                resolve(result.paymentMethod)
              }
            })
        })
      },
    })

    return (
      <div
        {...styles.container}
        onClick={() => {
          if (stripeLoadState === 'failed') {
            retryLoadStripe()
          }
        }}
      >
        {fieldElements.map(({ key, Element }) => (
          <StripeField
            key={key}
            Element={Element}
            fieldKey={key}
            unlockFieldKey={unlockFieldKey}
            setUnlockFieldKey={setUnlockFieldKey}
            style={style}
            t={t}
            dirty={dirty}
            errors={errors}
            onChange={onChange}
            stripeLoadState={stripeLoadState}
            setStripeLoadState={setStripeLoadState}
          />
        ))}
      </div>
    )
  },
)

let globalStripeState
const setupStripe = () => {
  const newState = {
    attempt: (globalStripeState?.attempt || 0) + 1,
    started: false,
  }
  newState.stripePromise = new Promise((resolve) => {
    newState.loadNow = ({ setStripeLoadState }) => {
      resolve({ setStripeLoadState })
      newState.started = true
    }
  }).then(({ setStripeLoadState }) => {
    setStripeLoadState('loading')
    return loadStripe().catch((error) => {
      setStripeLoadState('failed')
      return error
    })
  })
  return newState
}
// setup initially
globalStripeState = setupStripe()

const PrivacyWrapper = forwardRef((props, ref) => {
  const [colorScheme] = useColorContext()
  const { t } = props
  const [unlockFieldKey, setUnlockFieldKey] = useState(
    globalStripeState.started ? 'auto' : undefined,
  )
  const [stripeLoadState, setStripeLoadState] = useState()

  const retryLoadStripe = (e) => {
    if (e) {
      e.preventDefault()
    }
    globalStripeState = setupStripe()
    globalStripeState.loadNow({ setStripeLoadState })
  }

  useEffect(() => {
    if (unlockFieldKey && !globalStripeState.started) {
      globalStripeState.loadNow({
        setStripeLoadState,
      })
    }
  }, [unlockFieldKey])

  const options = {
    fonts: [
      {
        family: 'GT-America-Standard-Regular',
        weight: '400',
        src: 'url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.woff) format("woff"),url(https://cdn.repub.ch/s3/republik-assets/fonts/gt-america-standard-regular.ttf) format("truetype")',
      },
    ],
  }

  return (
    <Elements
      key={`attempt${globalStripeState.attempt}`}
      stripe={globalStripeState.stripePromise}
      options={options}
    >
      <Form
        {...props}
        ref={ref}
        unlockFieldKey={unlockFieldKey}
        setUnlockFieldKey={setUnlockFieldKey}
        stripeLoadState={stripeLoadState}
        setStripeLoadState={setStripeLoadState}
        retryLoadStripe={retryLoadStripe}
      />
      {stripeLoadState === 'failed' && (
        <Interaction.P>
          <span {...colorScheme.set('color', 'error')}>
            {t('payment/stripe/js/failed')}
          </span>
        </Interaction.P>
      )}
    </Elements>
  )
})

export default PrivacyWrapper
