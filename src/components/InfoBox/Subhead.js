import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifMedium15, sansSerifMedium18 } from '../Typography/styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { textAttributes } from './InfoBox'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  text: css({
    ...convertStyleToRem(sansSerifMedium15),
    marginBottom: '-12px',
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium18),
      marginBottom: '-14px'
    },
    color: colors.text
  })
}

export const Subhead = ({ children, attributes }) => {
  return (
    <p {...attributes} {...textAttributes} {...styles.text}>
      {children}
    </p>
  )
}

Subhead.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Subhead
