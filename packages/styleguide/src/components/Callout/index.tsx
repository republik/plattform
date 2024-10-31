import React, { FC, useMemo } from 'react'
import { css, keyframes } from 'glamor'
import PropTypes from 'prop-types'
import { mUp } from '../../theme/mediaQueries'
import zIndex from '../../theme/zIndex'
import { useColorContext } from '../Colors/useColorContext'

const slideUp = keyframes({
  from: {
    bottom: -400,
  },
  to: {
    bottom: 0,
  },
})

const styles = {
  calloutContainer: css({
    display: 'block',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: zIndex.overlay,
    background: 'rgba(0,0,0,0.5)',
    [mUp]: {
      position: 'relative',
      top: 18,
    },
  }),
  arrow: css({
    display: 'none',
    [mUp]: {
      display: 'block',
      transform: 'rotate(-45deg)',
      width: 14,
      height: 14,
      position: 'absolute',
      top: -7,
    },
  }),
  callout: css({
    display: 'block',
    zIndex: 1,
    position: 'absolute',
    left: 0,
    bottom: -400,
    right: 0,
    animation: `0.3s ${slideUp} 0.2s forwards`,
    textAlign: 'left',
    paddingTop: '24px',
    paddingLeft: 'calc(24px + env(safe-area-inset-left))',
    paddingRight: 'calc(24px + env(safe-area-inset-right))',
    paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
    [mUp]: {
      bottom: 'auto',
      top: 20,
      left: 'auto',
      animation: 'none',
      padding: 12,
    },
  }),
  right: {
    callout: css({
      [mUp]: {
        right: -9,
        left: 'auto',
      },
    }),
    arrow: css({
      right: 14,
    }),
  },
  left: {
    callout: css({
      [mUp]: {
        left: -9,
        right: 'auto',
      },
    }),
    arrow: css({
      left: 14,
    }),
  },
}

type Props = {
  children?: React.ReactNode
  align?: 'left' | 'right'
  onClose: () => void
}

const Callout = ({ children, align = 'left', onClose }: Props) => {
  const [colorScheme] = useColorContext()
  const calloutRule = useMemo(
    () =>
      css({
        backgroundColor: colorScheme.getCSSColor('overlay'),
        [mUp]: {
          boxShadow: colorScheme.getCSSColor('overlayShadow'),
        },
      }),
    [colorScheme],
  )
  return (
    <span {...styles.calloutContainer} onClick={onClose}>
      <span
        {...styles.callout}
        {...styles[align].callout}
        {...calloutRule}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          {...styles.arrow}
          {...colorScheme.set('backgroundColor', 'overlay')}
          {...styles[align].arrow}
        />
        {children}
      </span>
    </span>
  )
}

Callout.propTypes = {
  align: PropTypes.oneOf(['left', 'right']),
  onClose: PropTypes.func,
}

export default Callout
