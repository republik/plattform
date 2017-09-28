import React from 'react'
import { css } from 'glamor'

const styles = {
  base: {
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    lineHeight: '1.2em',
    margin: '0 0 0.2em'
  },
  h2: {
    fontSize: 28
  },
  h3: {
    fontSize: 18
  }
}

export const H2 = ({children}) => (
  <h2 {...css(styles.base)} {...css(styles.h2)}>
    {children}
  </h2>
)

export const H3 = ({children}) => (
  <h3 {...css(styles.base)} {...css(styles.h3)}>
    {children}
  </h3>
)
