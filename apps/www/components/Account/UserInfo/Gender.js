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
    [mediaQueries.mUp]: {
      fontSize: 21,
      marginTop: -1,
    },
  }),
}

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
  const [error, setError] = useState()

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

  const save = (gender) => {
    if (autosubmit) {
      setError()
      updateDetails({ gender })
        .then(() => {})
        .catch((e) => {
          setError(errorToString(e))
        })
    }
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
              <span {...styles.radio}>{gender}</span>
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
        <span {...styles.radio}>{X_GENDER}</span>
      </Radio>
      <Field
        disabled={!isX}
        label={t('profile/gender/custom')}
        value={values.genderCustom || values.gender}
        onChange={(_, newValue) => {
          onChange({
            values: {
              genderCustom: newValue,
            },
          })
        }}
        onBlur={() => values.genderCustom && save(values.genderCustom)}
      />
      {!!error && (
        <div style={{ color: colors.error, marginBottom: 40 }}>{error}</div>
      )}
    </>
  )
}

export default compose(withT, withMyDetailsMutation)(GenderField)
