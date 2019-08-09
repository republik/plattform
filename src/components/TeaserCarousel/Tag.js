import { css } from 'glamor'
import React from 'react'
import { sansSerifMedium14 } from '../Typography/styles'
import colors from '../../theme/colors'

const styles = {
  tag: css({
    ...sansSerifMedium14,
    margin: '0 0 10px 0'
  })
}

const Tag = ({ children, color = colors.feuilleton }) => {
  const customStyles = css(styles.tag, {
    color
  })

  return <div {...customStyles}>{children}</div>
}

export default Tag
