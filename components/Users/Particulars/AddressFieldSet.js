import React from 'react'
import withT from '../../../lib/withT'
import { FieldSet } from '@project-r/styleguide'

export const COUNTRIES = [
  'Schweiz',
  'Deutschland',
  'Österreich'
]

export const fields = t => [
  {
    label: t('me/addressForm/name/label'),
    name: 'name'
  },
  {
    label: t('me/addressForm/line1/label'),
    name: 'line1'
  },
  {
    label: t('me/addressForm/line2/label'),
    name: 'line2'
  },
  {
    label: t('me/addressForm/postalCode/label'),
    name: 'postalCode'
  },
  {
    label: t('me/addressForm/city/label'),
    name: 'city'
  },
  {
    label: t('me/addressForm/country/label'),
    name: 'country'
  }
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
