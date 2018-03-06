import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { mUp } from '../../theme/mediaQueries'

const styles = {
  quote: css({
    backgroundColor: '#f7f7f7',
    margin: 0,
    padding: '12px 15px',
    [mUp]: {
      padding: '20px 25px'
    }
  })
}

const BlockQuoteContent = ({ children, attributes }) => {
  return (
    <blockquote
      {...styles.quote}
    >
      {children}
    </blockquote>
  )
}

BlockQuoteContent.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default BlockQuoteContent
