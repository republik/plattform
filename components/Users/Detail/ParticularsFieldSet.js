import React from 'react'
import withT from '../../../lib/withT'
import { swissTime } from '../../../lib/utils/formats'
import FieldSet from '../../Form/FieldSet'

const birthdayFormat = '%d.%m.%Y'
const birthdayParse = swissTime.parse(birthdayFormat)

const fields = t => [
  {
    label: t('pledge/contact/firstName/label'),
    name: 'firstName',
    validator: value =>
      value.trim().length <= 0 &&
      t('pledge/contact/firstName/error/empty')
  },
  {
    label: t('pledge/contact/lastName/label'),
    name: 'lastName',
    validator: value =>
      value.trim().length <= 0 &&
      t('pledge/contact/lastName/error/empty')
  },
  {
    label: t('merci/updateMe/phone/label'),
    name: 'phoneNumber'
  },
  {
    label: t('merci/updateMe/birthday/label'),
    name: 'birthday',
    mask: '11.11.1111',
    maskChar: '_',
    validator: value => {
      const parsedDate = birthdayParse(value)

      return (
        (value.trim().length <= 0 &&
          t('merci/updateMe/birthday/error/empty')) ||
        parsedDate === null ||
        (parsedDate > new Date() &&
          t('merci/updateMe/birthday/error/invalid')) ||
        (parsedDate < new Date(1798, 3, 12) &&
          t('merci/updateMe/birthday/error/invalid'))
      )
    }
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
