import React from 'react'
import { css } from 'glamor'

const styles = {
  li: css({
    '& p:last-child': {
      marginBottom: 0
    }
  })
}

export const ListItem = ({ children }) => (
  <li {...styles.li}>{ children }</li>
)

export default ({ children, data }) => data.ordered
  ? <ol start={data.start}>{ children }</ol>
  : <ul>{ children }</ul>
