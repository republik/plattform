import React from 'react'

import { serifRegular16 } from '../../Typography/styles'

const styles = {
  container: {
    ...serifRegular16
  }
}

export default ({ children }) => (
  <div style={styles.container}>
    {children}
  </div>
)
