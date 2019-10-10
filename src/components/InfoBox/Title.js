import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifMedium16, sansSerifMedium19 } from '../Typography/styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { textAttributes } from './InfoBox'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  text: css({
    margin: '0 0 8px 0',
    borderTop: `1px solid ${colors.text}`,
    ...convertStyleToRem(sansSerifMedium16),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium19),
      margin: '0 0 12px 0'
    },
    color: colors.text
  })
}

export const Title = ({ children, attributes }) => {
  return (
    <p {...attributes} {...textAttributes} {...styles.text}>
      {children}
    </p>
  )
}

Title.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Title
