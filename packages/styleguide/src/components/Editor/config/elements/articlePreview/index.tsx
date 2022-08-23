import React from 'react'
import {
  ArticlePreviewElement,
  ElementConfigI,
  ElementFormProps,
} from '../../../custom-types'
import { ArticlePreviewIcon } from '../../../../Icons'
import { SketchPicker as ColorPicker } from 'react-color'
import { Label } from '../../../../Typography'
import { css } from 'glamor'
import ColorPickerCallout from '../../../../Chart/Editor/ColorPickerCallout'

const styles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridColumnGap: 20,
  }),
}

const Form: React.FC<ElementFormProps<ArticlePreviewElement>> = ({
  element,
  onChange,
}) => (
  <div {...styles.container}>
    <div>
      <Label>Text Color</Label>
      <ColorPickerCallout
        mode={undefined}
        pickableColors={undefined}
        color={element.color}
        onChange={(color) => onChange({ color })}
      />
    </div>
    <div>
      <Label>Background Color</Label>
      <ColorPicker
        color={element.backgroundColor}
        onChange={(backgroundColor) => onChange({ backgroundColor })}
      />
    </div>
  </div>
)

export const config: ElementConfigI = {
  Form,
  structure: [
    { type: 'figureImage' },
    { type: 'articlePreviewTextContainer', main: true },
  ],
  props: ['backgroundColor', 'color'],
  defaultProps: {
    backgroundColor: '#000',
    color: '#fff',
  },
  button: { icon: ArticlePreviewIcon },
}
