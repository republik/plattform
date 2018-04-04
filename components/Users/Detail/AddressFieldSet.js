import React from 'react'
import withT from '../../../lib/withT'
import FieldSet from '../../Form/FieldSet'

export const COUNTRIES = [
  'Schweiz',
  'Deutschland',
  'Österreich'
]

export const fields = t => [
  {
    label: t('me/addressForm/name/label'),
    name: 'name',
    validator: value =>
      !value &&
      t('me/addressForm/name/error/empty')
  },
  {
    label: t('me/addressForm/line1/label'),
    name: 'line1',
    validator: value =>
      !value &&
      t('me/addressForm/line1/error/empty')
  },
  {
    label: t('me/addressForm/line2/label'),
    name: 'line2'
  },
  {
    label: t('me/addressForm/postalCode/label'),
    name: 'postalCode',
    validator: value =>
      !value &&
      t('me/addressForm/postalCode/error/empty')
  },
  {
    label: t('me/addressForm/city/label'),
    name: 'city',
    validator: value =>
      !value &&
      t('me/addressForm/city/error/empty')
  },
  {
    label: t('me/addressForm/country/label'),
    name: 'country',
    validator: value =>
      !value &&
      t('me/addressForm/country/error/empty')
  }
]

const Form = ({
  t,
  values,
  errors,
  dirty,
  onChange
}) => (
  <FieldSet
    values={values}
    errors={errors}
    dirty={dirty}
    fields={fields(t)}
    onChange={onChange}
  />
)

export default withT(Form)
