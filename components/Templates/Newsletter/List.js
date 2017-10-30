import React from 'react'
import { css } from 'glamor'

const styles = {
  li: css({
    '& p:last-child': {
      marginBottom: 0
    }
  })
}

export const ListItem = ({ children, attributes = {} }) => (
  <li {...styles.li} {...attributes}>{ children }</li>
)

export default ({ children, data, attributes = {} }) => data.ordered
  ? <ol start={data.start} {...attributes}>{ children }</ol>
  : <ul>{ children }</ul>
