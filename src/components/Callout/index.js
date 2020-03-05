import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import colors from '../../theme/colors'

const slideUp = css.keyframes({
  from: {
    bottom: -400
  },
  to: {
    bottom: 0
  }
})

const styles = {
  calloutContainer: css({
    position: 'fixed',
    top: 45,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    background: 'rgba(0,0,0,0.5)',
    [mUp]: {
      position: 'absolute',
      top: 0,
      left: 'auto',
      bottom: 'auto',
      right: 0,
      background: 'none'
    }
  }),
  arrow: css({
    transform: 'rotate(-45deg)',
    background: colors.containerBg,
    borderTop: `1px solid ${colors.divider}`,
    borderRight: `1px solid ${colors.divider}`,
    width: 12,
    height: 12,
    position: 'absolute',
    top: -7,
    right: 15,
    display: 'none',
    [mUp]: {
      display: 'block'
    }
  }),
  callout: css({
    zIndex: 1,
    position: 'absolute',
    background: 'white',
    border: `1px solid ${colors.divider}`,
    left: 0,
    bottom: -400,
    right: 0,
    padding: 15,
    animation: `0.3s ${slideUp} 0.2s forwards`,
    [mUp]: {
      right: -10,
      left: 'auto',
      bottom: 'auto',
      top: 40,
      width: 175,
      padding: 10,
      animation: 'none'
    }
  })
}

const Callout = ({ expanded, setExpanded, children }) => {
  const handleClick = () => setExpanded(false)

  React.useEffect(() => {
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])

  return expanded ? (
    <div {...styles.calloutContainer}>
      <div {...styles.callout} onClick={e => e.stopPropagation()}>
        <div {...styles.arrow} />
        {children}
      </div>
    </div>
  ) : null
}

export default Callout
