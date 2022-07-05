import React from 'react'
import { ElementConfigI } from '../../../custom-types'

export const FlyerTile: React.FC<{
  [x: string]: unknown
}> = ({ props, children }) => {
  return (
    <div {...props} style={{ borderBottom: '1px solid white' }}>
      {children}
    </div>
  )
}

export const config: ElementConfigI = {
  component: 'flyerTile',
  structure: [
    { type: 'flyerMetaP' },
    { type: 'flyerTopic' },
    { type: 'flyerTitle' },
    { type: 'flyerAuthor' },
    { type: ['paragraph', 'ul', 'ol'], repeat: true },
    { type: ['articlePreview', 'pullQuote', 'figure', 'flyerPunchline'] },
  ],
}
