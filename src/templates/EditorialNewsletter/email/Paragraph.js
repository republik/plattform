import React from 'react'
import { fontFamilies } from '../../../theme/fonts'

export const paragraphStyle = {
  color: '#000',
  fontSize: '19px',
  lineHeight: '158%',
  fontFamily: fontFamilies.serifRegular
}

const strongStyle = {
  fontFamily: fontFamilies.serifBold,
  fontWeight: 'normal'
}

export const Br = () => <br />
export const Strong = ({ children }) => (
  <strong style={strongStyle}>{children}</strong>
)
export const Em = ({ children }) => <em>{children}</em>
export const Link = ({ children, href, title }) => (
  <a href={href} title={title} style={{ color: '#000', textDecorationSkip: 'ink' }}>
    {children}
  </a>
)

export default ({ children }) => <p style={paragraphStyle}>{children}</p>
