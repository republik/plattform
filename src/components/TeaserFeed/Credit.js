import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'

const styles = {
  main: css({
    margin: 0,
    ...sansSerifRegular14,
    [mUp]: {
      ...sansSerifRegular15
    },
    color: colors.text
  })
}

const Credit = ({ children }) => {
  return <p {...styles.main}>{children}</p>
}

Credit.propTypes = {
  children: PropTypes.node.isRequired
}

export default Credit
