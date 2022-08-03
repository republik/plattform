import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FigureImageElement,
  FigureImages,
} from '../../../custom-types'
import ImageInput from './ImageInput'
import { FigureImage as InnerFigureImage } from '../../../../Figure'
import { Label } from '../../../../Typography'
import { css } from 'glamor'

const PLACEHOLDER = '/static/placeholder.png'

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridColumnGap: 20,
  }),
}

export const FigureImage: React.FC<{
  images?: FigureImages
  alt?: string
  attributes: any
  [x: string]: unknown
}> = ({ children, images, alt, attributes, ...props }) => {
  return (
    <div {...attributes} {...props}>
      <div contentEditable={false}>
        <InnerFigureImage
          src={images?.default?.url || PLACEHOLDER}
          dark={{ src: images?.dark?.url }}
          alt={alt}
        />
      </div>
      {children}
    </div>
  )
}

const Form: React.FC<ElementFormProps<FigureImageElement>> = ({
  element,
  onChange,
}) => (
  <div {...styles.container}>
    <div>
      <Label>Light mode</Label>
      <ImageInput
        src={element.images?.default?.url}
        onChange={(url) => {
          onChange({ images: { ...element.images, default: { url } } })
        }}
      />
    </div>
    <div>
      <Label>Dark mode (optional)</Label>
      <ImageInput
        src={element.images?.dark?.url}
        onChange={(url) => {
          onChange({ images: { ...element.images, dark: { url } } })
        }}
      />
    </div>
  </div>
)

export const config: ElementConfigI = {
  Form,
  attrs: {
    isVoid: true,
    highlightSelected: true,
  },
  component: 'figureImage',
  props: ['images', 'alt'],
}
