import React from 'react'
import { css } from 'glamor'

import { useColorContext } from '../Colors/ColorContext'

export const ScrollyEnd = () => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.container} id='scrolly-end'>
      <span {...styles.text} {...colorScheme.set('background', 'default')}>
        Scrolly End
      </span>
    </div>
  )
}

const styles = {
  container: css({
    width: '100%',
    textAlign: 'center',
    borderBottom: '1px dashed grey',
    marginTop: 40,
    marginBottom: 40,
  }),
  text: css({
    paddingLeft: 10,
    paddingRight: 10,
  }),
}
