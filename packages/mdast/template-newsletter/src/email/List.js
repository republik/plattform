import React from 'react'

export const ListItem = ({ children }) => (
  <li>{ children }</li>
)

export default ({ children, data }) => data.ordered
  ? <ol start={data.start}>{ children }</ol>
  : <ul>{ children }</ul>
