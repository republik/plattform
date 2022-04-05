import { forwardRef, useEffect, useMemo, useState } from 'react'
import { css } from 'glamor'

import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'

import {
  fontStyles,
  colors,
  useColorContext,
  Interaction,
} from '@project-r/styleguide'

import { useResolvedColorSchemeKey } from '../../ColorScheme/lib'
import { SG_FONT_FACES } from '../../../lib/constants'

import { loadStripe } from '../stripe'
import StripeField from './StripeField'

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
    const colorSchemeKey = useResolvedColorSchemeKey()
    const stripe = useStripe()
    const elements = useElements()

    const style = {
      base: {
        ...fontStyles.sansSerifRegular,
        fontSize: '22px',
        color: colors[colorSchemeKey].text,
        lineHeight: '40px',
        '::placeholder': {
          color: colors[colorSchemeKey].disabled,
        },
      },
      invalid: {
        color: colors[colorSchemeKey].error,
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
  const options = useMemo(() => {
    const fontFamily = fontStyles.sansSerifRegular.fontFamily.split(',')[0]
    const def = SG_FONT_FACES?.split('@font-face').find((d) =>
      d.includes(fontFamily),
    )
    return {
      fonts: def
        ? [
            {
              family: fontFamily,
              weight: fontStyles.sansSerifRegular.fontWeight,
              src: def
                .split('src:')
                .slice(-1)[0] // get last src which wins in css
                .split(';')[0] // stop at ;
                .split('}')[0], // or }
            },
          ]
        : [],
    }
  })

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
