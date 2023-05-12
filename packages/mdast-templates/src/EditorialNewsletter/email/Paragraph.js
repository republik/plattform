import { Editorial } from '@project-r/styleguide/srccomponents/Typography'
import colors from '@project-r/styleguide/srctheme/colors'
import { fontFamilies } from '@project-r/styleguide/srctheme/fonts'
import React from 'react'

export const paragraphStyle = {
  color: colors.text,
  fontSize: '19px',
  lineHeight: '158%',
  fontFamily: fontFamilies.serifRegular,
}

export const linkStyle = {
  color: colors.text,
  textDecoration: 'underline',
  textDecorationSkip: 'ink',
}

export const Br = () => <br />
export const A = ({ children, href, title }) => (
  <a href={href} title={title} style={linkStyle}>
    {children}
  </a>
)

// emails normally don't do glamor but
// Editorial.fontRule is manually injected in ./Container
export default ({ children }) => (
  <p style={paragraphStyle} className={Editorial.fontRule}>
    {children}
  </p>
)
