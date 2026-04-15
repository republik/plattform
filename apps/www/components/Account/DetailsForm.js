import { Interaction, Loader, useColorContext } from '@project-r/styleguide'
import AddressForm from './AddressForm'
import FieldSet from '../FieldSet'
import { useTranslation } from '../../lib/withT'
import { useEffect } from 'react'

const { H2 } = Interaction

const DetailsForm = ({
  data,
  values,
  errors,
  dirty,
  onChange,
  errorMessages,
  showErrors,
  style,
  askForName,
  askForPhoneNumber,
  askForAddress,
}) => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()
  const { loading, error, me } = data

  useEffect(() => {
    if (me) {
      let newValues
      let newErrors
      if (askForPhoneNumber) {
        if (!dirty.phoneNumber && !values.phoneNumber && me.phoneNumber) {
          newValues = {
            ...newValues,
            phoneNumber: me.phoneNumber,
          }
          newErrors = {
            ...newErrors,
            phoneNumber: undefined,
          }
        }
      } else if (errors.phoneNumber) {
        newErrors = {
          ...newErrors,
          phoneNumber: undefined,
        }
      }
      if (askForAddress) {
        if (!dirty.name && !values.name && me.name) {
          newValues = {
            ...newValues,
            name: me.name,
          }
          newErrors = {
            ...newErrors,
            name: undefined,
          }
        }
        if (me.address) {
          ;['line1', 'line2', 'postalCode', 'city', 'country'].forEach(
            (field) => {
              if (!dirty[field] && !values[field] && me.address[field]) {
                newValues = {
                  ...newValues,
                  [field]: me.address[field],
                }
                newErrors = {
                  ...newErrors,
                  [field]: undefined,
                }
              }
            },
          )
        }
      } else {
        ;['name', 'line1', 'line2', 'postalCode', 'city', 'country'].forEach(
          (field) => {
            if (errors[field]) {
              newErrors = {
                ...newErrors,
                [field]: undefined,
              }
            }
          },
        )
      }
      if (newValues || newErrors) {
        onChange({ values: newValues, errors: newErrors })
      }
    }
  }, [me, dirty, askForAddress, askForPhoneNumber])

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const meFields = [
          askForName && {
            label: t('pledge/contact/firstName/label'),
            name: 'firstName',
            required: true,
            validator: (value) =>
              value.trim().length <= 0 &&
              t('pledge/contact/firstName/error/empty'),
          },
          askForName && {
            label: t('pledge/contact/lastName/label'),
            name: 'lastName',
            required: true,
            validator: (value) =>
              value.trim().length <= 0 &&
              t('pledge/contact/lastName/error/empty'),
          },
          askForPhoneNumber && {
            label: t('Account/Update/phone/label/alt'),
            name: 'phoneNumber',
          },
        ].filter(Boolean)

        const showMeField = meFields.length > 0

        if (!showMeField && !askForAddress) {
          return null
        }

        return (
          <div style={style}>
            <H2 style={{ marginBottom: 10 }}>
              {t('Account/Update/details/title')}
            </H2>
            <div>
              {showMeField && (
                <>
                  <FieldSet
                    values={values}
                    errors={errors}
                    dirty={dirty}
                    onChange={onChange}
                    fields={meFields}
                  />
                  <br />
                  <br />
                  <br />
                </>
              )}
              {askForAddress && (
                <>
                  <AddressForm
                    values={values}
                    errors={errors}
                    dirty={dirty}
                    onChange={onChange}
                  />
                  <br />
                  <br />
                  <br />
                </>
              )}
              {showErrors && errorMessages.length > 0 && (
                <div
                  {...colorScheme.set('color', 'error')}
                  style={{
                    marginBottom: 40,
                  }}
                >
                  {t('pledge/submit/error/title')}
                  <br />
                  <ul>
                    {errorMessages.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )
      }}
    />
  )
}

export default DetailsForm
