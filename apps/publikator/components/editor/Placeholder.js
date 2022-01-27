import React from 'react'
import { css } from 'glamor'

export default ({ children }) => {
  const style = {
    position: 'absolute',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
    pointerEvents: 'none',
    opacity: 0.333
  }

  return (
    <span contentEditable={false} style={style}>
      {children}
    </span>
  )
}

const styles = {
  inline: css({
    pointerEvents: 'none',
    opacity: 0.333,
    ':empty::before': {
      content: 'attr(data-text)'
    }
  })
}

export const Inline = ({ children }) => {
  return (
    <span {...styles.inline} data-text={children} contentEditable={false} />
  )
}
