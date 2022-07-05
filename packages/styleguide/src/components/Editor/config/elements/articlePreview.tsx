import {
  ArticlePreviewElement,
  ElementConfigI,
  ElementFormProps,
} from '../../custom-types'
import React from 'react'

export const ArticlePreview: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => (
  <div {...attributes} {...props}>
    <div contentEditable={false}>ARTICLE PREVIEW BLOCK</div>
    {children}
  </div>
)

const Form: React.FC<ElementFormProps<ArticlePreviewElement>> = ({
  element,
  onChange,
}) => <div>ARTICLE PREVIEW FORM</div>

export const config: ElementConfigI = {
  component: 'articlePreview',
  Form,
  attrs: {
    isVoid: true,
    highlightSelected: true,
  },
}
