import React from 'react'
import {
  ArticlePreviewElement,
  ElementConfigI,
  ElementFormProps,
} from '../../custom-types'
import { css } from 'glamor'
import { serifTitle38, serifRegular23 } from '../../../Typography/styles'
import { ArticlePreviewIcon } from '../../../Icons'

// TODO: Maybe – kachel wysiwyg
export const ArticlePreview: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => (
  <div {...attributes} {...props}>
    <div
      contentEditable={false}
      style={{ color: '#69f95a', backgroundColor: '#534E42' }}
    >
      <img src='/static/flyer-article-cover.png' width='100%' />
      <div
        style={{
          textAlign: 'center',
          padding: '30px 30px 10px',
        }}
      >
        <h3 {...css(serifTitle38)} style={{ margin: 0 }}>
          Ein Jahr unter den Taliban
        </h3>
        <p {...css(serifRegular23)}>
          Als sie Kabul einnahmen, gaben sich die Taliban versöhnlich: Niemand
          habe Vergeltung zu befürchten, Mädchen dürften in die Schule, Frauen
          arbeiten. Heute sieht die Realität in Afghanistan ganz anders aus.
        </p>
      </div>
    </div>
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
  button: { icon: ArticlePreviewIcon },
}
