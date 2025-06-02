import { useEffect, useState } from 'react'

import {
  Field,
  Radio,
  Label,
  useColorContext,
  colors,
} from '@project-r/styleguide'

import { errorToString } from '../../../lib/utils/errors'

import withT from '../../../lib/withT'
import compose from 'lodash/flowRight'
import { withMyDetailsMutation } from '../enhancers'
import { mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  radio: css({
    fontSize: 17,
    lineHeight: 1.1,
    marginTop: -1,
    display: 'inline-block',
    whiteSpace: 'nowrap',
    marginBottom: 10,
    marginRight: 15,
    [mediaQueries.mUp]: {
      fontSize: 21,
      marginTop: -1,
    },
  }),
}

// https://nibi.space/geschlechtsabfragen
const GENDER_SUGGESTIONS = ['weiblich', 'männlich']
const X_GENDER = 'weiteres'
const NO_GENDER = 'keine Angabe'

const GenderField = ({
  values,
  autosubmit,
  updateDetails,
  onChange,
  isMandadory,
  t,
}) => {
  const [colorScheme] = useColorContext()
  const [gender, setGender] = useState(values.gender)
  const [customGender, setCustomGender] = useState(
    !GENDER_SUGGESTIONS.some((suggestion) => values.gender === suggestion) &&
      values.gender,
  )
  const [error, setError] = useState()

  const isX = customGender || gender === X_GENDER

  useEffect(() => {
    if (isMandadory && !values.gender) {
      onChange({
        errors: {
          gender: t('profile/gender/empty'),
        },
      })
    }
  }, [isMandadory, onChange, values, t])

  const save = (gender) => {
    if (!autosubmit) return
    setError()
    updateDetails({ gender })
      .then(() => {})
      .catch((e) => {
        setError(errorToString(e))
      })
  }

  const onChangeHandler = (newGenderValue) => {
    onChange({
      values: {
        gender: newGenderValue,
      },
      errors: {
        gender: undefined,
      },
    })
    save(newGenderValue)
  }

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Label>
          <span {...colorScheme.set('color', 'disabled')}>
            {t('profile/gender')}
          </span>
        </Label>
      </div>
      {GENDER_SUGGESTIONS.map((suggestion) => (
        <Radio
          value={suggestion}
          key={suggestion}
          checked={gender === suggestion}
          onChange={() => {
            setGender(suggestion)
            setCustomGender(undefined)
            onChangeHandler(suggestion)
          }}
        >
          <span {...styles.radio}>{suggestion}</span>
        </Radio>
      ))}
      <Radio
        value={X_GENDER}
        checked={isX}
        onChange={() => {
          setGender(X_GENDER)
          setCustomGender(X_GENDER)
          onChangeHandler(X_GENDER)
        }}
      >
        <span {...styles.radio}>{X_GENDER}</span>
      </Radio>
      <Radio
        value={NO_GENDER}
        checked={!gender}
        onChange={() => {
          setGender(undefined)
          setCustomGender(undefined)
          onChangeHandler(null)
        }}
      >
        <span {...styles.radio}>{NO_GENDER}</span>
      </Radio>
      <Field
        label={t('profile/gender/custom')}
        disabled={!isX}
        value={isX ? customGender || '' : gender || NO_GENDER}
        onChange={(_, newValue) => {
          setCustomGender(newValue)
          onChange({
            values: {
              gender: newValue || gender,
            },
          })
        }}
        onBlur={() => save(customGender || gender)}
      />

      {!!error && (
        <div style={{ color: colors.error, marginBottom: 40 }}>{error}</div>
      )}
    </>
  )
}

export default compose(withT, withMyDetailsMutation)(GenderField)
