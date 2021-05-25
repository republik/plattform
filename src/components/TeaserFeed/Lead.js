import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { serifRegular15, serifRegular17 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  main: css({
    ...convertStyleToRem(serifRegular15),
    margin: '0 0 5px 0',
    [mUp]: {
      ...convertStyleToRem(serifRegular17)
    }
  })
}

const Lead = ({ children }) => {
  return <p {...styles.main}>{children}</p>
}

Lead.propTypes = {
  children: PropTypes.node.isRequired
}

export default Lead
