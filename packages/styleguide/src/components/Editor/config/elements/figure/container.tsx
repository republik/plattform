import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FigureElement,
} from '../../../custom-types'
import { Interaction, Label } from '../../../../Typography'
import Radio from '../../../../Form/Radio'
import { IconImageOutline } from '@republik/icons'

// TODO: not the best code – just meant as an example of
//  a parent form accessed through clicking the child...
const Form: React.FC<ElementFormProps<FigureElement>> = ({
  element,
  onChange,
}) => (
  <div>
    <Label>Size</Label>
    <Interaction.P>
      <Radio
        value={undefined}
        checked={!element.size}
        onChange={() => onChange({ size: undefined })}
      >
        Normal
      </Radio>
      <br />
      <Radio
        value='tiny'
        checked={element.size === 'tiny'}
        onChange={() => onChange({ size: 'tiny' })}
      >
        Tiny
      </Radio>
    </Interaction.P>
  </div>
)

export const config: ElementConfigI = {
  Form,
  button: { icon: IconImageOutline },
  props: ['size'],
  structure: [{ type: 'figureImage', main: true }, { type: 'figureCaption' }],
}
