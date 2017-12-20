import React from 'react'
import { css } from 'glamor'
import { Editorial } from '../Typography'

const styles = {
  more: css({
    marginTop: '40px',
    textAlign: 'center'
  })
}

const More = ({ children }) => {
  return (
    <div {...styles.more}>
      <Editorial.A>{children}</Editorial.A>
    </div>
  )
}

export default More
