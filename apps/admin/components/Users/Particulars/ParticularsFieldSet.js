import withT from '../../../lib/withT'
import { FieldSet } from '@project-r/styleguide'

const fields = (t) => [
  {
    label: t('pledge/contact/firstName/label'),
    name: 'firstName',
    validator: (value) =>
      value.trim().length <= 0 && t('pledge/contact/firstName/error/empty'),
  },
  {
    label: t('pledge/contact/lastName/label'),
    name: 'lastName',
    validator: (value) =>
      value.trim().length <= 0 && t('pledge/contact/lastName/error/empty'),
  },
  {
    label: t('merci/updateMe/phone/label'),
    name: 'phoneNumber',
  },
  {
    label: t('Account/Update/birthyear/label/optional'),
    name: 'birthyear',
    mask: '1111',
    maskChar: '_',
    validator: (value) => {
      return (
        !!value.trim().length &&
        (value === null || value > new Date().getFullYear() || value < 1900) &&
        t('Account/Update/birthyear/error/invalid')
      )
    },
  },
]

const Form = ({ t, values, errors, dirty, onChange }) => (
  <FieldSet
    values={{ ...values, birthyear: values?.birthyear?.toString() || '' }}
    errors={errors}
    dirty={dirty}
    fields={fields(t)}
    onChange={onChange}
  />
)

export default withT(Form)
