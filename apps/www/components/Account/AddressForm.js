import { useState, useEffect } from 'react'
import { FieldSet, Interaction, A, usePrevious } from '@project-r/styleguide'

import withT from '../../lib/withT'
import { intersperse } from '../../lib/utils/helpers'
import { Hint } from './Elements'

export const COUNTRIES = ['Schweiz', 'Deutschland', 'Österreich']

export const DEFAULT_COUNTRY = COUNTRIES[0]

export const fields = (t) => [
  {
    label: t('Account/AddressForm/name/label'),
    name: 'name',
    autoComplete: 'name',
    validator: (value) =>
      (!value?.length && t('Account/AddressForm/name/error/empty')) ||
      (value?.length > 70 &&
        t('Account/AddressForm/name/error/tooLong', { maxLength: 70 })),
    explanation: <Hint t={t} tKey={'Account/AddressForm/name/explanation'} />,
  },
  {
    label: t('Account/AddressForm/line1/label'),
    name: 'line1',
    autoComplete: 'address-line1',
    validator: (value) =>
      (!value?.length && t('Account/AddressForm/line1/error/empty')) ||
      (value?.length > 70 &&
        t('Account/AddressForm/line1/error/tooLong', { maxLength: 70 })),
  },
  {
    label: t('Account/AddressForm/line2/label'),
    name: 'line2',
    autoComplete: 'address-line2',
  },
  {
    label: t('Account/AddressForm/postalCode/label'),
    name: 'postalCode',
    autoComplete: 'postal-code',
    validator: (value) =>
      !value && t('Account/AddressForm/postalCode/error/empty'),
  },
  {
    label: t('Account/AddressForm/city/label'),
    name: 'city',
    autoComplete: 'address-level2',
    validator: (value) =>
      (!value?.length && t('Account/AddressForm/city/error/empty')) ||
      (value?.length > 35 &&
        t('Account/AddressForm/city/error/tooLong', { maxLength: 35 })),
  },
  {
    label: t('Account/AddressForm/country/label'),
    name: 'country',
    autoComplete: 'country-name',
    validator: (value) =>
      !value && t('Account/AddressForm/country/error/empty'),
  },
]

export const isEmptyAddress = (values, me) => {
  const addressString = [
    values.name,
    values.line1,
    values.line2,
    values.postalCode,
    values.city,
    values.country,
  ]
    .join('')
    .trim()
  const emptyAddressString = [me.name, DEFAULT_COUNTRY].join('').trim()

  return addressString === emptyAddressString
}

const Form = ({ t, values, errors, dirty, onChange }) => (
  <FieldSet
    values={values}
    errors={errors}
    dirty={dirty}
    fields={fields(t)}
    onChange={onChange}
  />
)

export const AddressView = ({ values }) => {
  return (
    <Interaction.P>
      {intersperse(
        [
          values.name,
          values.line1,
          values.line2,
          `${values.postalCode} ${values.city}`,
          values.country,
        ].filter(Boolean),
        (_, i) => (
          <br key={i} />
        ),
      )}
    </Interaction.P>
  )
}

export const AutoForm = withT(
  ({
    values,
    errors,
    dirty,
    fields,
    onChange,
    existingAddress,
    name,
    t,
    afterEdit,
  }) => {
    const [mode, setMode] = useState(existingAddress ? 'view' : 'edit')

    const previousName = usePrevious(name)
    const currentName = values.name
    const dirtyName = dirty.name
    useEffect(() => {
      if (
        currentName !== name &&
        ((!dirtyName && previousName === currentName) ||
          (!currentName && previousName !== name))
      ) {
        onChange({
          values: { name },
          dirty: {
            name: false,
          },
          errors: FieldSet.utils.getErrors(fields, { ...values, name }),
        })
      }
    }, [previousName, currentName, name, dirtyName])

    if (mode === 'view') {
      return (
        <>
          <AddressView values={values} />
          <br />
          <A
            href='#'
            onClick={(e) => {
              e.preventDefault()
              setMode('edit')
            }}
          >
            {t('Account/AddressForm/edit')}
          </A>
        </>
      )
    }

    return (
      <>
        <FieldSet
          values={values}
          errors={errors}
          dirty={dirty}
          fields={fields}
          onChange={onChange}
        />
        {afterEdit}
        {existingAddress && (
          <>
            <br />
            <A
              href='#'
              onClick={(e) => {
                e.preventDefault()
                onChange({
                  values: existingAddress,
                  errors: FieldSet.utils.getErrors(fields, existingAddress),
                })
                setMode('view')
              }}
            >
              {t('Account/AddressForm/reset')}
            </A>
          </>
        )}
      </>
    )
  },
)

export default withT(Form)
