import React from 'react'
import PropTypes from 'prop-types'
import { Figure } from '../Figure'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  imageContainer: css({
    margin: '0 0 15px 0',
    [mUp]: {
      margin: '0 15px 15px 0',
      width: '155px'
    }
  })
}

const PullQuoteFigure = ({ children, attributes }) => {
  return (
    <div {...attributes} {...styles.imageContainer}>
      <Figure>{children}</Figure>
    </div>
  )
}

PullQuoteFigure.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default PullQuoteFigure
