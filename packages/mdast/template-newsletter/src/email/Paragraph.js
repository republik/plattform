import React from 'react'

export const Br = () => <br />
export const Strong = ({ children }) => <strong>{ children }</strong>
export const Em = ({ children }) => <em>{ children }</em>
export const Link = ({ children, href, title }) => (
  <a
    href={href}
    title={title}>
    { children }
  </a>
)

export default ({children}) => (
  <p>{ children }</p>
)
