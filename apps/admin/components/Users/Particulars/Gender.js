import withT from '../../../lib/withT'
import compose from 'lodash/flowRight'

import { useState } from 'react'

import { css } from 'glamor'

import { Field, Radio, Label, useColorContext } from '@project-r/styleguide'

const styles = {
  radio: css({
    lineHeight: 1.1,
    display: 'inline-block',
    whiteSpace: 'nowrap',
    marginBottom: 10,
    marginRight: 15,
    fontSize: 21,
    marginTop: -1,
  }),
}

// https://nibi.space/geschlechtsabfragen
const GENDER_SUGGESTIONS = ['weiblich', 'männlich']
const X_GENDER = 'weiteres'
const NO_GENDER = 'keine Angabe'

const GenderField = ({ values, onChange, t }) => {
  const [colorScheme] = useColorContext()
  const [gender, setGender] = useState(values.gender)
  const [customGender, setCustomGender] = useState(
    !GENDER_SUGGESTIONS.some((suggestion) => values.gender === suggestion) &&
      values.gender,
  )

  const isX = customGender || gender === X_GENDER

  const onChangeHandler = (newGenderValue) => {
    onChange({
      values: {
        gender: newGenderValue,
      },
      errors: {
        gender: undefined,
      },
      dirty: { gender: true },
    })
  }

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Label>
          <span {...colorScheme.set('color', 'disabled')}>
            {t('Account/Update/gender/label/optional')}
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
        disabled={!isX}
        label={t('Account/Update/gender/label/custom')}
        value={customGender || ''}
        onChange={(_, newValue) => {
          setCustomGender(newValue)
          onChangeHandler(newValue)
        }}
      />
    </>
  )
}

export default compose(withT)(GenderField)
