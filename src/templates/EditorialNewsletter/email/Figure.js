import React from 'react'
import { fontFamilies } from '../../../theme/fonts'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'

export const Image = ({ src, alt }) =>
  <img key='image'
    style={{
      border: '0px',
      borderTop: '1px solid #555',
      paddingTop: '13px',
      width: '640px',
      height: 'auto',
      margin: '0px',
      maxWidth: '100% !important'
    }}
    width='640'
    src={imageResizeUrl(src, '600x')}
    alt={alt}
  />

export const Caption = ({ children, data }) => (
  <p key='caption' style={{
    fontSize: '15px',
    fontFamily: fontFamilies.sansSerifRegular,
    marginTop: '5px',
    marginBottom: '30px',
    textAlign: 'left'
  }}>
    {children}
  </p>
)

export const Byline = ({ children, data }) => (
  <span key='caption' style={{
    fontSize: '12px',
    fontFamily: fontFamilies.sansSerifRegular
  }}>
    {children}
  </span>
)

export default ({ children }) =>
  <span>
    {children}
  </span>
