import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FlyerAuthorElement,
} from '../../../../custom-types'

export const FlyerAuthor: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => (
  <div {...attributes} {...props}>
    <div contentEditable={false}>AUTHOR BLOCK</div>
    {children}
  </div>
)

const Form: React.FC<ElementFormProps<FlyerAuthorElement>> = ({
  element,
  onChange,
}) => <div>AUTHOR FORM</div>

export const config: ElementConfigI = {
  component: 'flyerAuthor',
  Form,
  attrs: {
    isVoid: true,
    highlightSelected: true,
  },
}
