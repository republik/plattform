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
    <div
      contentEditable={false}
      style={{ display: 'flex', alignItems: 'center', padding: '15px 0' }}
    >
      <img src='/static/christof_moser.jpg' width='50' />
      <span
        style={{
          fontWeight: 300,
          fontFamily: 'GT America',
          fontSize: 16,
          textTransform: 'uppercase',
          paddingLeft: 15,
        }}
      >
        Author Authorson
      </span>
    </div>
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
