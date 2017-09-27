import React from 'react'
import { css } from 'glamor'

const styles = {
  container: {
    fontFamily: 'serif',
    fontSize: 18,
    color: '#444',
    WebkitFontSmoothing: 'antialiased',
    backgroundColor: '#fff',
    width: '100%'
  }
}

export default ({children}) => (
  <div {...css(styles.container)}>
    {children}
  </div>
)
