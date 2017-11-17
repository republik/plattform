import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  main: css({
    borderTop: '1px solid #000',
    paddingTop: '5px',
    margin: '0 0 30px 0',
    [mUp]: {
      margin: '0 0 40px 0',
      paddingTop: '8px'
    },
    '[data-type="editorial"]': {
      borderColor: colors.editorial
    },
    '[data-type="meta"]': {
      borderColor: colors.meta
    },
    '[data-type~="social"]': {
      borderColor: colors.social
    }
  })
}

const Teaser = ({ children, type }) => {
  const dataType = type ? { 'data-type': type } : {}
  return (
    <div {...styles.main} {...dataType}>
      {children}
    </div>
  )
}

Teaser.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf([null, 'editorial', 'meta', 'social', 'social meta'])
}

Teaser.defaultProps = {
  type: null
}

export default Teaser
