import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { serifRegular17, serifRegular19 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  main: css({
    ...convertStyleToRem(serifRegular17),
    margin: '0 0 5px 0',
    [mUp]: {
      ...convertStyleToRem(serifRegular19)
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
