import React from 'react'
import { css } from 'glamor'

import { mUp } from '../../theme/mediaQueries'

const styles = {
  container: css({
    margin: '30px auto',
    [mUp]: {
      margin: '40px auto',
    },
    ':first-child': {
      marginTop: 0,
    },
    ':last-child': {
      marginBottom: 0,
    },
    '& figcaption': {
      marginLeft: 0,
      marginRight: 0,
    },
  }),
}

type BlockQuoteProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'div'>
}

const BlockQuote = ({ children, attributes }: BlockQuoteProps) => {
  return (
    <div {...styles.container} {...attributes}>
      {children}
    </div>
  )
}

export default BlockQuote
