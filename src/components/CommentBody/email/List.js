import React from 'react'

import { fontFamilies } from '../../../theme/fonts'
import { paragraphStyle } from './Paragraph'

const listStyle = {
  marginLeft: '1em',
  paddingLeft: '1em'
}

export const ListItem = ({ children }) => (
  <li style={paragraphStyle}>{ children }</li>
)

export default ({ children, data }) => data.ordered
  ? <ol start={data.start} style={ listStyle }>{ children }</ol>
  : <ul style={ listStyle }>{ children }</ul>
