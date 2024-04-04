import React from 'react'

import { fontFamilies } from '../../../theme/fonts'
import { BlockCodeProps } from '../interfaces'

export default function BlockCode({ children }: BlockCodeProps) {
  return (
    <pre style={{ margin: '20px auto', whiteSpace: 'pre-wrap' }}>
      <code
        style={{
          backgroundColor: '#f7f7f7',
          display: 'block',
          fontFamily: fontFamilies.monospaceRegular,
          fontSize: '14px',
          margin: 0,
          padding: '20px 15px 20px 15px',
        }}
      >
        {children}
      </code>
    </pre>
  )
}
