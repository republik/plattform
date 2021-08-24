import React from 'react'

const List = ({ children, ordered, start }) => {
  if (ordered) return <ol start={start}>{children}</ol>
  return <ul>{children}</ul>
}

export default List

export const ListItem = ({ children }) => <li>{children}</li>
