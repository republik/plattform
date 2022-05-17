import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FigureImageElement,
} from '../../../../custom-types'
import ImageInput from './ImageInput'
import { FigureImage } from '../../../../../Figure'
import { Label } from '../../../../../Typography'
import { css } from 'glamor'

const PLACEHOLDER = '/static/placeholder.png'

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridColumnGap: 20,
  }),
}

const ImageComponent: React.FC<{
  src?: string
  srcDark?: string
  alt?: string
  attributes: any
  [x: string]: unknown
}> = ({
  children,
  src = PLACEHOLDER,
  srcDark = PLACEHOLDER,
  alt,
  attributes,
  ...props
}) => (
  <div {...attributes} {...props}>
    <div contentEditable={false}>
      <FigureImage src={src} dark={{ src: srcDark }} alt={alt} />
    </div>
    {children}
  </div>
)

const Form: React.FC<ElementFormProps<FigureImageElement>> = ({
  element,
  onChange,
}) => (
  <div {...styles.container}>
    <div>
      <Label>Light mode</Label>
      <ImageInput
        src={element.src}
        onChange={(src) => {
          onChange({ src })
        }}
      />
    </div>
    <div>
      <Label>Dark mode (optional)</Label>
      <ImageInput
        src={element.srcDark}
        onChange={(srcDark) => {
          onChange({ srcDark })
        }}
      />
    </div>
  </div>
)

export const config: ElementConfigI = {
  Component: ImageComponent,
  Form,
  attrs: {
    isVoid: true,
    isMain: true,
    highlightSelected: true,
  },
}
