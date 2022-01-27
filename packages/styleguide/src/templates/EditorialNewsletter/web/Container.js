import React from 'react'
import { css } from 'glamor'
import { fontStyles } from '../../../theme/fonts'
import { useColorContext } from '../../../components/Colors/useColorContext'

const styles = {
  container: {
    ...fontStyles.serifRegular,
    fontSize: 18,
    WebkitFontSmoothing: 'antialiased',
    width: '100%',
    margin: 0,
    padding: 0
  }
}

export default ({ children, attributes = {} }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...css(styles.container)}
      {...colorScheme.set('backgroundColor', 'default')}
      {...colorScheme.set('color', 'text')}
      {...attributes}
    >
      {children}
    </div>
  )
}
