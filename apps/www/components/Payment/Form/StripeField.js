import { useEffect, useState } from 'react'
import { Field, Spinner } from '@project-r/styleguide'

const LoadingIcon = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 250)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) {
    return null
  }
  return (
    <span style={{ display: 'inline-block', height: 30, width: 30 }}>
      <Spinner size={30} />
    </span>
  )
}

const StripeField = ({
  Element,
  fieldKey,
  style,
  t,
  dirty,
  errors,
  onChange,
  unlockFieldKey,
  setUnlockFieldKey,
  stripeLoadState,
  setStripeLoadState,
}) => {
  const [isEmpty, setEmpty] = useState(true)
  const [isFocussed, setFocus] = useState()

  useEffect(() => {
    onChange({
      errors: {
        [fieldKey]: t(`payment/stripe/${fieldKey}/error/empty`),
      },
    })
    return () => {
      onChange({
        errors: {
          [fieldKey]: undefined,
        },
        dirty: {
          [fieldKey]: undefined,
        },
      })
    }
  }, [])

  const label = t(`payment/stripe/${fieldKey}/label`)
  const error = dirty[fieldKey] && errors[fieldKey]

  return (
    <Field
      label={label}
      value={isEmpty ? '' : ' '}
      error={error}
      icon={
        stripeLoadState === 'loading' && unlockFieldKey === fieldKey ? (
          <LoadingIcon />
        ) : undefined
      }
      renderInput={
        !unlockFieldKey
          ? (props) => (
              <input
                {...props}
                onFocus={(e) => {
                  e.preventDefault()
                  setUnlockFieldKey(fieldKey)
                }}
              />
            )
          : ({ onFocus, onBlur, className }) => (
              <div className={className}>
                <Element
                  onFocus={() => {
                    setFocus(true)
                    onFocus()
                  }}
                  onBlur={() => {
                    setFocus(false)
                    onBlur({
                      target: { value: isEmpty ? '' : ' ' },
                    })
                  }}
                  onChange={(event) => {
                    setEmpty(event.empty)
                    onChange({
                      values:
                        fieldKey === 'cardNumber'
                          ? {
                              cardType:
                                event.brand === 'unknown'
                                  ? undefined
                                  : event.brand,
                            }
                          : undefined,
                      errors: {
                        [fieldKey]: event.empty
                          ? t(`payment/stripe/${fieldKey}/error/empty`)
                          : event.error
                          ? t.first([
                              `payment/stripe/${fieldKey}/error/${event.error.code}`,
                              `payment/stripe/${fieldKey}/error/generic`,
                            ])
                          : undefined,
                      },
                      dirty: {
                        [fieldKey]: true,
                      },
                    })
                  }}
                  onReady={(element) => {
                    if (unlockFieldKey === fieldKey) {
                      element.focus()
                    }
                    if (stripeLoadState === 'loading') {
                      setStripeLoadState('ready')
                    }
                  }}
                  options={{
                    classes: {
                      base: `StripeElement StripeElement-${fieldKey} ${className}`,
                    },
                    style:
                      // CVC has a placeholder which says the samething as the label -> hide
                      fieldKey === 'cvc' || !(isFocussed || !isEmpty || error)
                        ? {
                            ...style,
                            base: {
                              ...style.base,
                              '::placeholder': {
                                color: 'transparent',
                              },
                            },
                          }
                        : style,
                  }}
                />
              </div>
            )
      }
    />
  )
}

export default StripeField
