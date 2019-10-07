import React from 'react'
import PropTypes from 'prop-types'
import { fontRule } from '../Typography/Interaction'
import { sansSerifRegular15, sansSerifRegular18 } from '../Typography/styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { textAttributes } from './InfoBox'
import { convertStyleToRem, pxToRem } from '../Typography/utils'

const styles = {
  text: css({
    ...convertStyleToRem(sansSerifRegular15),
    lineHeight: pxToRem('24px'),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular18)
    },
    color: colors.text,
    ':nth-of-type(2)': {
      marginTop: 0
    }
  })
}

export const Text = ({ children, attributes }) => {
  return (
    <p {...attributes} {...textAttributes} {...styles.text} {...fontRule}>
      {children}
    </p>
  )
}

Text.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Text
