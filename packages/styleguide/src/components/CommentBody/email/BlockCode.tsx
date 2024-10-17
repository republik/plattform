import React from 'react'

import { fontFamilies } from '../../../theme/fonts'
import { BlockCodeProps } from '../web/BlockCode'

const BlockCode = ({ children }: BlockCodeProps) => (
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

export default BlockCode
