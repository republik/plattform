import {
  ElementConfigI,
  ElementFormProps,
  FlyerDateElement,
} from '../../../../custom-types'
import React from 'react'
import Field from '../../../../../Form/Field'
import { timeFormat } from '../../../../../../lib/timeFormat'
import { FLYER_DATE_FORMAT } from '../../../../../Flyer/Date'

const Form: React.FC<ElementFormProps<FlyerDateElement>> = ({
  element,
  onChange,
}) => {
  return (
    <Field
      label='Datum'
      type='date'
      value={element.date || ''}
      onChange={(_, date: string) => {
        onChange({ date })
      }}
    />
  )
}

export const config: ElementConfigI = {
  attrs: {
    isVoid: true,
  },
  Form,
  props: ['date'],
}
