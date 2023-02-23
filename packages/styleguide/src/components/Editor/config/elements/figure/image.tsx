import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FigureImageElement,
} from '../../../custom-types'
import ImageInput from '../../../Forms/ImageInput'
import { Label } from '../../../../Typography'
import { css } from 'glamor'

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridColumnGap: 20,
  }),
}

const Form: React.FC<ElementFormProps<FigureImageElement>> = ({
  element,
  onChange,
}) => (
  <div {...styles.container}>
    <div>
      <Label>Default Image</Label>
      <ImageInput
        src={element.images?.default?.url}
        onChange={(url) => {
          onChange({ images: { ...element.images, default: { url } } })
        }}
      />
    </div>
    <div>
      <Label>Dark Mode Image</Label>
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
  },
  props: ['images', 'alt'],
}
