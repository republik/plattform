import { useEffect, useState } from 'react'

import { Field, Radio, Label, useColorContext } from '@project-r/styleguide'

import withT from '../../../lib/withT'

const SUGGESTIONS = ['weiblich', 'männlich']
// https://de.wikipedia.org/wiki/Divers
const X_GENDER = 'divers'

const GenderField = ({ values, onChange, isMandadory, t }) => {
  const [colorScheme] = useColorContext()
  useEffect(() => {
    if (isMandadory && !values.gender) {
      onChange({
        errors: {
          gender: t('profile/gender/empty'),
        },
      })
    }
  }, [isMandadory])
  const [shouldAutoFocus, setShouldAutoFocus] = useState()

  const value = values.gender
  const isX =
    value?.trim() && !SUGGESTIONS.some((suggestion) => suggestion === value)

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Label>
          <span {...colorScheme.set('color', 'disabled')}>
            {t('profile/gender')}
          </span>
        </Label>
      </div>
      {SUGGESTIONS.map((suggestion) => (
        <>
          <span
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              marginBottom: 10,
              marginRight: 10,
            }}
          >
            <Radio
              value={value}
              checked={value === suggestion}
              onChange={() => {
                onChange({
                  values: {
                    gender: suggestion,
                    genderCustom: undefined,
                  },
                  errors: {
                    gender: undefined,
                  },
                })
              }}
            >
              {suggestion}
            </Radio>
          </span>{' '}
        </>
      ))}
      <Radio
        value={X_GENDER}
        checked={isX}
        onChange={() => {
          setShouldAutoFocus(true)
          onChange({
            values: {
              gender: X_GENDER,
            },
            errors: {
              gender: undefined,
            },
          })
        }}
      >
        {X_GENDER}
      </Radio>
      {isX && (
        <>
          <br />
          <Field
            renderInput={(props) => (
              <input autoFocus={shouldAutoFocus} {...props} />
            )}
            label={t('profile/gender/custom')}
            value={
              values.genderCustom ||
              (values.gender !== X_GENDER ? values.gender : '')
            }
            onChange={(_, newValue) => {
              onChange({
                values: {
                  genderCustom: newValue,
                },
              })
            }}
          />
        </>
      )}
    </>
  )
}

export default withT(GenderField)
