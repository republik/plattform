import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FigureElement,
} from '../../../custom-types'
import { ImageIcon } from '../../../../Icons'
import { Interaction, Label } from '../../../../Typography'
import Radio from '../../../../Form/Radio'

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
  button: { icon: ImageIcon },
  component: 'figure',
  props: ['size'],
  structure: [{ type: 'figureImage', main: true }, { type: 'figureCaption' }],
}
