import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'
import {
  sansSerifMedium14,
  sansSerifMedium16,
  serifRegular17,
  serifRegular19
} from '../Typography/styles'

const styles = {
  main: css({
    ...convertStyleToRem(serifRegular17),
    margin: '10px 0 5px 0',
    [mUp]: {
      ...convertStyleToRem(serifRegular19)
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
