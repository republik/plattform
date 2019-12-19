import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'
import {
  sansSerifMedium14,
  sansSerifMedium16,
  sansSerifRegular16,
  sansSerifRegular18
} from '../Typography/styles'

const styles = {
  main: css({
    ...convertStyleToRem(sansSerifRegular16),
    margin: '10px 0 5px 0',
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular18)
    },
    color: colors.text
  }),
  label: css({
    color: colors.lightText,
    ...convertStyleToRem(sansSerifMedium14),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium16)
    }
  })
}

const Highlight = ({ children, label }) => {
  return (
    <p {...styles.main}>
      {!!label && <span {...styles.label}>{label}:</span>} {children}
    </p>
  )
}

Highlight.propTypes = {
  children: PropTypes.node.isRequired
}

export default Highlight
