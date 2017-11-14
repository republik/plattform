import React from 'react'
import PropTypes from 'prop-types'
import { serifBold24, serifBold28 } from '../Typography/styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  text: css({
    ...serifBold24,
    [mUp]: {
      ...serifBold28
    },
    color: colors.text
  })
}

export const Text = ({ children, attributes, isQuoted = true }) => {
  return (
    <div {...attributes} {...styles.text}>
      {isQuoted ? <span>«{children}»</span> : <span>{children}</span>}
    </div>
  )
}

Text.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  isQuoted: PropTypes.bool
}

export default Text
