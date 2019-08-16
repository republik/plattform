import { css } from 'glamor'
import React from 'react'
import { sansSerifMedium14 } from '../Typography/styles'
import colors from '../../theme/colors'

const styles = css({
  ...sansSerifMedium14,
  margin: '0 0 10px 0'
})

const Format = ({ children, color = colors.feuilleton }) => {
  const customStyles = css(styles, {
    color
  })

  return <div {...customStyles}>{children}</div>
}

export default Format
