import React from 'react'
import { css } from 'glamor'

const styles = {
  paragraph: {
    margin: '0 0 0.8em'
  },
  link: {
    color: '#222',
    textDecoration: 'underline',
    ':visited': {
      color: '#222',
      textDecoration: 'underline'
    },
    ':hover': {
      color: '#444'
    }
  }
}

export const Br = () => <br />
export const Strong = ({ children }) => <strong>{ children }</strong>
export const Em = ({ children }) => <em>{ children }</em>
export const Link = ({ children, data }) => (
  <a {...css(styles.link)}
    href={data.href}
    title={data.title}>
    { children }
  </a>
)

export default ({children}) => (
  <p {...css(styles.paragraph)}>{ children }</p>
)
