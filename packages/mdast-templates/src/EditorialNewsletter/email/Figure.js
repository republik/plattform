import { fontFamilies } from '@project-r/styleguide/src/theme/fonts'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'
import React from 'react'

export const Image = ({ src, alt, plain }) => (
  <img
    key='image'
    style={{
      border: '0px',
      borderTop: plain ? undefined : '1px solid #555',
      paddingTop: plain ? undefined : '13px',
      width: '640px',
      height: 'auto',
      margin: '0px',
      maxWidth: '100% !important',
    }}
    width='600'
    src={imageResizeUrl(src, '600x')}
    alt={alt}
  />
)

export const Caption = ({ children, data }) => (
  <p
    key='caption'
    style={{
      fontSize: '15px',
      fontFamily: fontFamilies.sansSerifRegular,
      marginTop: '5px',
      marginBottom: '30px',
      textAlign: 'left',
    }}
  >
    {children}
  </p>
)

export const Byline = ({ children, data }) => (
  <span
    key='caption'
    style={{
      fontSize: '12px',
      fontFamily: fontFamilies.sansSerifRegular,
    }}
  >
    {children}
  </span>
)

export default ({ children }) => <span>{children}</span>
