import React from 'react'
import colors from '../../../theme/colors'
import { fontFamilies } from '../../../theme/fonts'

export const paragraphStyle = {
  color: colors.text,
  fontSize: '19px',
  lineHeight: '158%',
  fontFamily: fontFamilies.serifRegular
}

export const linkStyle = {
  color: colors.text,
  textDecoration: 'underline',
  textDecorationSkip: 'ink'
}

const emphasisStyle = {
  color: colors.text,
  fontFamily: fontFamilies.serifBold,
  fontWeight: 'normal'
}
const cursiveStyle = {
  fontFamily: fontFamilies.serifItalic,
  fontWeight: 'normal'
}

export const Br = () => <br />
export const Emphasis = ({ children }) => (
  <strong style={emphasisStyle}>{children}</strong>
)
export const Cursive = ({ children }) => <em style={cursiveStyle}>{children}</em>
export const Link = ({ children, href, title }) => (
  <a href={href} title={title} style={linkStyle}>
    {children}
  </a>
)

export default ({ children }) => <p style={paragraphStyle}>{children}</p>
