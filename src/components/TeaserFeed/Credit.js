import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  main: css({
    margin: 0,
    ...convertStyleToRem(sansSerifRegular14),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular15)
    }
  })
}

const Credit = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <p {...styles.main} {...colorScheme.rules.text.color}>
      {children}
    </p>
  )
}

Credit.propTypes = {
  children: PropTypes.node.isRequired
}

export default Credit
