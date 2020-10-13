import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifMedium14, sansSerifMedium16 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  main: css({
    ...convertStyleToRem(sansSerifMedium14),
    margin: '0 0 6px 0',
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium16),
      margin: '-5px 0 8px 0'
    }
  })
}

export const Format = ({ children, cssColor }) => {
  const [colorScheme] = useColorContext()

  return (
    <p {...styles.main} {...colorScheme.set('color', cssColor)}>
      {children}
    </p>
  )
}

Format.propTypes = {
  children: PropTypes.node.isRequired,
  cssColor: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ])
}

export default Format
