import { Field, Radio, Label, useColorContext } from '@project-r/styleguide'

import withT from '../../../lib/withT'
import compose from 'lodash/flowRight'

// https://nibi.space/geschlechtsabfragen
const GENDER_SUGGESTIONS = ['weiblich', 'männlich']
const X_GENDER = 'weiteres'

const GenderField = ({ values, onChange, t }) => {
  const [colorScheme] = useColorContext()

  const currentGender = values.gender
  const isX =
    !!currentGender &&
    !GENDER_SUGGESTIONS.some((gender) => gender === currentGender)

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Label>
          <span {...colorScheme.set('color', 'disabled')}>
            {t('Account/Update/gender/label/optional')}
          </span>
        </Label>
      </div>
      {GENDER_SUGGESTIONS.map((gender) => (
        <>
          <span
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              marginBottom: 10,
              marginRight: 15,
            }}
          >
            <Radio
              value={currentGender}
              checked={currentGender === gender}
              onChange={() => {
                onChange({
                  values: {
                    gender,
                    genderCustom: undefined,
                  },
                  errors: {
                    gender: undefined,
                  },
                  dirty: { gender: true },
                })
              }}
            >
              {gender}
            </Radio>
          </span>
        </>
      ))}
      <Radio
        value={X_GENDER}
        checked={isX}
        onChange={() => {
          onChange({
            values: {
              gender: X_GENDER,
              genderCustom: X_GENDER,
            },
            errors: {
              gender: undefined,
            },
            dirty: { gender: true },
          })
        }}
      >
        {X_GENDER}
      </Radio>
      <Field
        disabled={!isX}
        label={t('Account/Update/gender/label/custom')}
        value={values.genderCustom || values.gender}
        onChange={(_, newValue) => {
          onChange({
            values: {
              genderCustom: newValue,
            },
            errors: {
              genderCustom: undefined,
            },
            dirty: { genderCustom: true },
          })
        }}
      />
    </>
  )
}

export default compose(withT)(GenderField)
