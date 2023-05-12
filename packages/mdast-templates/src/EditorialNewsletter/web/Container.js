import { useColorContext } from '@project-r/styleguide/src/components/Colors/useColorContext'
import { fontStyles } from '@project-r/styleguide/src/theme/fonts'
import { css } from 'glamor'
import React from 'react'

const styles = {
  container: {
    ...fontStyles.serifRegular,
    fontSize: 18,
    WebkitFontSmoothing: 'antialiased',
    width: '100%',
    margin: 0,
    padding: 0,
  },
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
