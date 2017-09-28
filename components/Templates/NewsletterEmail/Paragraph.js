import React from 'react'

export const Strong = ({ children }) => <strong>{ children }</strong>
export const Em = ({ children }) => <em>{ children }</em>
export const Link = ({ children, data }) => (
  <a
    href={data.href}
    title={data.title}>
    { children }
  </a>
)

export default ({children}) => (
  <p>{ children }</p>
)
