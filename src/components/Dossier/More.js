import React from 'react'
import { css } from 'glamor'
import { link } from '../Typography/Editorial'

const styles = {
  more: css({
    textAlign: 'center'
  })
}

const More = ({ children }) => {
  return <div {...styles.more} {...link}>{children}</div>
}

export default More
