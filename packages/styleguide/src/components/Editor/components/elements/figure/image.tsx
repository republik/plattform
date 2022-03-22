import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FigureImageElement,
} from '../../../custom-types'
import ImageInput from './ImageInput'
import { FigureImage } from '../../../../Figure'
import { Label } from '../../../../Typography'
import { css } from 'glamor'

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridColumnGap: 20,
  }),
}

const Component: React.FC<{
  element: FigureImageElement
  [x: string]: unknown
}> = ({ children, element, ...props }) => (
  <div {...props}>
    <div contentEditable={false}>
      <FigureImage
        {...{ src: element.src || '/static/placeholder.png', ...element }}
      />
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
  Component,
  Form,
  attrs: {
    isVoid: true,
    isMain: true,
  },
}
