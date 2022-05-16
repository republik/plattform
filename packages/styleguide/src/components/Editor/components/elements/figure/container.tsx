import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FigureElement,
} from '../../../custom-types'
import { ImageIcon } from '../../../../Icons'
import { Interaction, Label } from '../../../../Typography'
import { Figure } from '../../../../Figure'
import Radio from '../../../../Form/Radio'

const Component: React.FC<{
  size: string
  attributes: any
  [x: string]: unknown
}> = ({ children, size, attributes, ...props }) => {
  const { ref, ...attrs } = attributes
  return (
    <Figure {...attrs} size={size} {...props}>
      {children}
    </Figure>
  )
}

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
  Component,
  Form,
  structure: [{ type: 'figureImage' }, { type: 'figureCaption' }],
  button: { icon: ImageIcon },
}
