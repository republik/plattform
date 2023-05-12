import React from 'react'
import { fontStyles } from '@project-r/styleguide/src/theme/fonts'

const BlockQuote = ({ children }) => <div>{children}</div>

export default BlockQuote

export const ParagraphWrapper = ({ children }) => (
  <div
    style={{
      backgroundColor: '#F6F8F7',
    }}
  >
    {children}
  </div>
)

export const Paragraph = ({ children }) => (
  <p
    style={{
      margin: '20px 25px',
      ...fontStyles.sansSerifRegular,
      fontSize: '18px',
      lineHeight: '30px',
      // Display 'inline-block' is needed to make sure that the bg-color
      // of the parent-element is also applied to the margin on the y-axis
      display: 'inline-block',
    }}
  >
    {children}
  </p>
)
