import { Interaction, Loader, useColorContext } from '@project-r/styleguide'
import AddressForm from './AddressForm'
import FieldSet from '../FieldSet'
import { useTranslation } from '../../lib/withT'

const { H2 } = Interaction

const fields = (t) => [
  {
    label: t('Account/Update/phone/label/alt'),
    name: 'phoneNumber',
  },
]

const DetailsForm = ({
  data,
  values,
  errors,
  dirty,
  onChange,
  errorMessages,
  showErrors,
  style,
}) => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()
  const { loading, error } = data

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const meFields = fields(t)

        return (
          <div style={style}>
            <H2 style={{ marginBottom: 30 }}>
              {t('Account/Update/details/title')}
            </H2>
            <div>
              <br />
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
              <AddressForm
                values={values}
                errors={errors}
                dirty={dirty}
                onChange={onChange}
              />
              <br />
              <br />
              <br />
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
