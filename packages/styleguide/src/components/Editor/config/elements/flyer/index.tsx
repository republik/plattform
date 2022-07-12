import React from 'react'
import { ElementConfigI } from '../../../custom-types'
import { css } from 'glamor'

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
    '& > :first-child': {
      paddingTop: 90,
    },
    '& > :last-child': {
      paddingBottom: 90,
    },
  }),
}

export const FlyerTile: React.FC<{
  [x: string]: unknown
}> = ({ props, children }) => (
  <div {...props} {...styles.container}>
    {children}
  </div>
)

export const config: ElementConfigI = {
  component: 'flyerTile',
  structure: [
    { type: 'flyerMetaP' },
    { type: 'flyerTopic' },
    { type: 'flyerTitle' },
    { type: 'flyerAuthor' },
    { type: ['paragraph', 'ul', 'ol'], repeat: true },
    { type: ['flyerPunchline', 'pullQuote', 'articlePreview', 'figure'] },
  ],
}
