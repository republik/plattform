import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FlyerAuthorElement,
} from '../../../../custom-types'

export const FlyerAuthor: React.FC<{
  authorId?: string
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, authorId, ...props }) => (
  <div {...attributes} {...props}>
    <div
      contentEditable={false}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '15px 0',
        opacity: authorId ? 1 : 0.4,
      }}
    >
      <img
        style={{ marginRight: 15 }}
        src={
          authorId ? '/static/christof_moser.jpg' : '/static/placeholder.png'
        }
        width='50'
        height='50'
      />
      <span
        style={{
          fontWeight: 300,
          fontFamily: 'GT America',
          fontSize: 16,
          textTransform: 'uppercase',
        }}
      >
        {authorId ? 'Christof Moser' : 'Flyer Author'}
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
  props: ['authorId'],
  attrs: {
    isVoid: true,
    highlightSelected: true,
  },
}
