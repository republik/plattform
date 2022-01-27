import React from 'react'
import colors from '../../../theme/colors'
import { fontFamilies } from '../../../theme/fonts'

export const paragraphStyle = {
  color: colors.text,
  fontSize: '16px',
  lineHeight: '158%',
  margin: '10px 0',
  fontFamily: fontFamilies.serifRegular
}

export const linkStyle = {
  color: colors.text,
  textDecoration: 'underline',
  textDecorationSkip: 'ink'
}

const strikeThroughStyle = {
  textDecoration: 'line-through'
}

const codeStyle = {
  backgroundColor: '#f7f7f7',
  borderRadius: '2px',
  display: 'inline-block',
  fontFamily: fontFamilies.monospaceRegular,
  fontSize: '14px',
  padding: '0 5px'
}

const definitionStyle = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: '15px',
  margin: '10px 0'
}

export const Link = ({ children, href, title }) => (
  <a href={href} title={title} style={linkStyle}>
    {children}
  </a>
)

export const StrikeThrough = ({ children }) => (
  <span style={strikeThroughStyle}>{children}</span>
)

export const Code = ({ children }) => <code style={codeStyle}>{children}</code>

export const Definition = ({ children }) => (
  <p style={definitionStyle}>{children}</p>
)

export const Paragraph = ({ children }) => (
  <p style={paragraphStyle}>{children}</p>
)

export const Heading = ({ children }) => (
  <Paragraph>
    <strong>{children}</strong>
  </Paragraph>
)
