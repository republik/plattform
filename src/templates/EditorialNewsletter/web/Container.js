import React from 'react'
import { css } from 'glamor'
import { fontStyles } from '../../../theme/fonts'

const styles = {
  container: {
    ...fontStyles.serifRegular,
    fontSize: 18,
    color: '#000',
    WebkitFontSmoothing: 'antialiased',
    backgroundColor: '#fff',
    width: '100%',
    margin: 0,
    padding: 0
  }
}

export default ({ children, attributes = {} }) => (
  <div {...css(styles.container)} {...attributes}>
    {children}
  </div>
)
