import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifMedium14, sansSerifMedium16 } from '../Typography/styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  main: css({
    ...sansSerifMedium14,
    margin: '0 0 10px 0',
    [mUp]: {
      ...sansSerifMedium16,
      margin: '0 0 12px 0'
    },
    textDecoration: 'underline',
    '[data-type="editorial"] > &': {
      color: colors.editorial
    },
    '[data-type="meta"] > &': {
      color: colors.meta
    },
    '[data-type~="social"] > &': {
      color: colors.social
    }
  })
}

export const Format = ({ children }) => {
  return <p {...styles.main}>{children}</p>
}

Format.propTypes = {
  children: PropTypes.node.isRequired
}

export default Format
