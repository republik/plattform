import withT from '../../../lib/withT'
import { FieldSet } from '@project-r/styleguide'

export const COUNTRIES = ['Schweiz', 'Deutschland', 'Österreich']

export const fields = (t) => [
  {
    label: t('me/addressForm/name/label'),
    name: 'name',
    validator: (value) =>
      value?.length > 70 &&
      t('me/addressForm/name/error/tooLong', { maxLength: 70 }),
  },
  {
    label: t('me/addressForm/line1/label'),
    name: 'line1',
    validator: (value) =>
      value?.length > 70 &&
      t('me/addressForm/line1/error/tooLong', { maxLength: 70 }),
  },
  {
    label: t('me/addressForm/line2/label'),
    name: 'line2',
  },
  {
    label: t('me/addressForm/postalCode/label'),
    name: 'postalCode',
  },
  {
    label: t('me/addressForm/city/label'),
    name: 'city',
    validator: (value) =>
      value?.length > 35 &&
      t('me/addressForm/city/error/tooLong', { maxLength: 35 }),
  },
  {
    label: t('me/addressForm/country/label'),
    name: 'country',
  },
]

const Form = ({ t, values, errors, dirty, onChange }) => (
  <FieldSet
    values={values}
    errors={errors}
    dirty={dirty}
    fields={fields(t)}
    onChange={onChange}
  />
)

export default withT(Form)
