import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular15, sansSerifRegular18 } from '../Typography/styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { textAttributes } from './InfoBox'

const styles = {
  text: css({
    ...sansSerifRegular15,
    lineHeight: '24px',
    [mUp]: {
      ...sansSerifRegular18
    },
    color: colors.text,
    ':nth-of-type(2)': {
      marginTop: 0
    }
  })
}

export const Text = ({ children, attributes }) => {
  return (
    <p {...attributes} {...textAttributes} {...styles.text}>
      {children}
    </p>
  )
}

Text.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Text
