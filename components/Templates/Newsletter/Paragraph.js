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
export const Strong = ({ children, attributes = {} }) =>
  <strong {...attributes}>{ children }</strong>
export const Em = ({ children, attributes = {} }) =>
  <em {...attributes}>{ children }</em>
export const Link = ({ children, data, attributes = {} }) => (
  <a {...css(styles.link)}
    href={data.href}
    title={data.title}
    {...attributes}>
    { children }
  </a>
)

export default ({children, attributes = {}}) => (
  <p {...css(styles.paragraph)} {...attributes}>{ children }</p>
)
