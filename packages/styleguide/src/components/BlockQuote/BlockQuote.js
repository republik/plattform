import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { mUp } from '../../theme/mediaQueries'

const styles = {
  container: css({
    margin: '30px auto',
    [mUp]: {
      margin: '40px auto',
    },
    '& figcaption': {
      marginLeft: 0,
      marginRight: 0,
    },
  }),
}

const BlockQuote = ({ children, attributes }) => {
  return (
    <div {...styles.container} {...attributes}>
      {children}
    </div>
  )
}

BlockQuote.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
}

export default BlockQuote
