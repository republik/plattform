import {
  ElementConfigI,
  ElementFormProps,
  FlyerDateElement,
} from '../../../../custom-types'
import React from 'react'
import Field from '../../../../../Form/Field'
import { timeFormat } from '../../../../../../lib/timeFormat'

const Form: React.FC<ElementFormProps<FlyerDateElement>> = ({
  element,
  onChange,
}) => {
  return (
    <Field
      label='Datum'
      type='date'
      value={timeFormat('%Y-%m-%d')(element.value)}
      onChange={(_, date: string) => {
        onChange({ value: new Date(date) })
      }}
    />
  )
}

export const config: ElementConfigI = {
  attrs: {
    isVoid: true,
  },
  Form,
  props: ['value'],
  defaultProps: {
    value: () => new Date(),
  },
}
