import React from 'react'

export default ({children}) => {
  const style = {
    position: 'absolute',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
    pointerEvents: 'none',
    opacity: '0.333'
  }

  return (
    <span contentEditable={false} style={style}>
      {children}
    </span>
  )
}
