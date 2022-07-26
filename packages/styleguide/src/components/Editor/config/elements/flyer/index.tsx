import React from 'react'
import {
  ElementConfigI,
  ElementFormProps,
  FlyerTileElement,
} from '../../../custom-types'
import { css } from 'glamor'
import { FlyerTileIcon } from '../../../../Icons'

const styles = {
  container: css({
    borderBottom: '2px solid white',
    '& > *': {
      maxWidth: 700,
      margin: '0 auto',
    },
    '& > h1': {
      maxWidth: 900,
    },
    '& > :not(.ui-element)': {
      paddingTop: 90,
    },
    '& > :not(.ui-element) ~ :not(.ui-element)': {
      paddingTop: 'inherit',
    },
    '& > :last-child': {
      paddingBottom: 90,
    },
  }),
}

export const FlyerTile: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  return (
    <div {...props} {...attributes} {...styles.container}>
      {children}
    </div>
  )
}

const Form: React.FC<ElementFormProps<FlyerTileElement>> = ({
  element,
  onChange,
}) => <div>FLYER TILE FORM</div>

export const config: ElementConfigI = {
  component: 'flyerTile',
  structure: [
    { type: 'flyerMetaP', main: true },
    { type: 'flyerTopic' },
    { type: 'flyerTitle' },
    { type: 'flyerAuthor' },
    { type: ['paragraph', 'ul', 'ol'], repeat: true },
    {
      type: ['flyerPunchline', 'pullQuote', 'articlePreview', 'figure', 'quiz'],
    },
  ],
  Form,
  attrs: {
    blockUi: {
      position: {
        top: 0,
        left: 0,
      },
    },
  },
  button: { icon: FlyerTileIcon },
}
