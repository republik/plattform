import React from 'react'
import { css } from 'glamor'

import { mUp } from '../../../theme/mediaQueries'

const styles = {
  pre: css({
    margin: '20px auto'
  }),
  code: css({
    backgroundColor: '#f7f7f7',
    display: 'block',
    fontSize: '90%',
    margin: 0,
    padding: '0 15px 12px 15px',
    [mUp]: {
      padding: '0 25px 20px 25px',
      '&:first-child': {
        paddingTop: '20px'
      }
    },
    '&:first-child': {
      paddingTop: '12px'
    }
  })
}

export default ({ children }) => (
  <pre {...styles.pre}>
    <code {...styles.code}>
      {children}
    </code>
  </pre>
)
