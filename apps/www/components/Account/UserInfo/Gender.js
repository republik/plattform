import { useEffect } from 'react'

import { Field, Radio, Label, useColorContext } from '@project-r/styleguide'

import withT from '../../../lib/withT'
import { MAX_WIDTH } from '../../../../../packages/styleguide/src/components/Center'

const GENDER_SUGGESTIONS = ['weiblich', 'männlich']
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
  }, [isMandadory, onChange, values, t])

  const currentGender = values.gender
  const isX = !GENDER_SUGGESTIONS.some((gender) => gender === currentGender)

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Label>
          <span {...colorScheme.set('color', 'disabled')}>
            {t('profile/gender')}
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
          })
        }}
      >
        {X_GENDER}
      </Radio>
      <Field
        disabled={!isX}
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
  )
}

export default withT(GenderField)
