import React from 'react'
import {
  ArticlePreviewElement,
  ElementConfigI,
  ElementFormProps,
} from '../../custom-types'
import { ArticlePreviewIcon } from '../../../Icons'

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
  button: { icon: ArticlePreviewIcon },
}
