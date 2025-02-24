import { useEffect } from 'react'

import { Field, Radio, Label, useColorContext } from '@project-r/styleguide'

import withT from '../../../lib/withT'
import questionStyles from '../../Questionnaire/questionStyles'
import compose from 'lodash/flowRight'
import { withMyDetailsMutation } from '../enhancers'

// https://nibi.space/geschlechtsabfragen
const GENDER_SUGGESTIONS = ['weiblich', 'männlich']
const X_GENDER = 'weiteres'

const GenderField = ({
  values,
  autosubmit,
  updateDetails,
  onChange,
  isMandadory,
  t,
}) => {
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

  const save = (gender) => autosubmit && updateDetails({ gender })

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
                save(gender)
              }}
            >
              <span {...questionStyles.radio}>{gender}</span>
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
          save(X_GENDER)
        }}
      >
        <span {...questionStyles.radio}>{X_GENDER}</span>
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
        onBlur={() => values.genderCustom && save(values.genderCustom)}
      />
    </>
  )
}

export default compose(withT, withMyDetailsMutation)(GenderField)
