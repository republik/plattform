import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular12, sansSerifRegular15 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { PADDING } from '../Center'
import { convertStyleToRem, pxToRem } from '../Typography/utils'

const styles = {
  caption: css({
    margin: '5px auto 0 auto',
    width: '100%',
    maxWidth: `calc(100vw - ${PADDING * 2}px)`,
    ...convertStyleToRem(sansSerifRegular12),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular15),
      lineHeight: pxToRem('18px')
    }
  })
}

export const Caption = ({ children, attributes }) => {
  return (
    <figcaption {...attributes} {...styles.caption}>
      {children}
    </figcaption>
  )
}

Caption.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Caption
