import React from 'react'
import { css } from 'glamor'

const styles = {
  container: css({
    backgroundColor: '#fff'
  })
}

export default ({children}) => (
  <div {...styles.container}>
    {children}
  </div>
)
