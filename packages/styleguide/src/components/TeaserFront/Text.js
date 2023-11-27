import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import { useColorContext } from '../Colors/useColorContext'

const TEXT_PADDING = 50

const positionHalfWidth = {
  position: 'absolute',
  width: `calc(50% - ${TEXT_PADDING}px)`,
}

const positionFullWidth = {
  position: 'absolute',
  left: `${TEXT_PADDING}px`,
  right: `${TEXT_PADDING}px`,
}

const styles = {
  rootPosition: css({
    [tUp]: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: 'hidden',
    },
  }),
  rootMiddle: css({
    [tUp]: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  }),
  positioned: css({
    position: 'static',
  }),
  topleft: css({
    position: 'static',
    [tUp]: {
      position: 'absolute',
      inset: 0,
      padding: `${TEXT_PADDING}px 50% ${TEXT_PADDING}px ${TEXT_PADDING}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
  }),
  topright: css({
    position: 'static',
    [tUp]: {
      position: 'absolute',
      inset: 0,
      padding: `${TEXT_PADDING}px ${TEXT_PADDING}px ${TEXT_PADDING}px 50%`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
  }),
  bottomleft: css({
    position: 'static',
    [tUp]: {
      position: 'absolute',
      inset: 0,
      padding: `${TEXT_PADDING}px 50% ${TEXT_PADDING}px ${TEXT_PADDING}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
  }),
  bottomright: css({
    position: 'static',
    [tUp]: {
      position: 'absolute',
      inset: 0,
      padding: `${TEXT_PADDING}px ${TEXT_PADDING}px ${TEXT_PADDING}px 50%`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
  }),
  split: css({
    position: 'static',
    [tUp]: {
      position: 'absolute',
      inset: 0,
      padding: `${TEXT_PADDING}px 5% ${TEXT_PADDING}px calc(50% + 5%)`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  }),
  splitreverse: css({
    position: 'static',
    [tUp]: {
      position: 'absolute',
      inset: 0,
      padding: `${TEXT_PADDING}px calc(50% + 5%) ${TEXT_PADDING}px 5%`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  }),
  top: css({
    position: 'static',
    [tUp]: {
      position: 'absolute',
      inset: 0,
      padding: `${TEXT_PADDING}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
  }),
  middle: css({
    position: 'static',
    [tUp]: {
      position: 'absolute',
      inset: 0,
      padding: `${TEXT_PADDING}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  }),
  bottom: css({
    position: 'static',
    [tUp]: {
      position: 'absolute',
      inset: 0,
      padding: `${TEXT_PADDING}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
  }),
  center: css({
    textAlign: 'center',
  }),
  centerMobileOnly: css({
    textAlign: 'center',
    [mUp]: {
      textAlign: 'inherit',
    },
  }),
}

const Text = ({
  children,
  attributes,
  position,
  center,
  color,
  collapsedColor,
  maxWidth,
  margin,
  feuilleton,
  audioPlayButton,
}) => {
  const [colorScheme] = useColorContext()
  const textAlignStyle =
    feuilleton && !center
      ? styles.centerMobileOnly
      : center
      ? styles.center
      : undefined
  const rootStyles = position ? styles.rootPosition : {}
  const middleStyles = position === 'middle' ? styles.rootMiddle : {}

  const colorRule = useMemo(
    () =>
      collapsedColor
        ? css({
            color: collapsedColor,
            [tUp]: {
              color: colorScheme.getCSSColor(color || 'text'),
            },
          })
        : css({
            color: colorScheme.getCSSColor(color || 'text'),
          }),
    [colorScheme, collapsedColor, color],
  )

  return (
    <div {...rootStyles} {...middleStyles}>
      <div
        data-position={position ?? 'none'}
        {...attributes}
        {...colorRule}
        {...textAlignStyle}
        {...css(styles.positioned, position ? styles[position] : {})}
        style={{ maxWidth, margin }}
      >
        {' '}
        <div>
          {children}
          {audioPlayButton && (
            <div style={{ marginTop: 20 }}>{audioPlayButton}</div>
          )}
        </div>
      </div>
    </div>
  )
}

Text.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  position: PropTypes.oneOf([
    'topleft',
    'topright',
    'bottomleft',
    'bottomright',
    'top',
    'middle',
    'bottom',
  ]),
  center: PropTypes.bool,
  color: PropTypes.string,
  collapsedColor: PropTypes.string,
  maxWidth: PropTypes.string,
  margin: PropTypes.string,
  feuilleton: PropTypes.bool,
  audioPlayButton: PropTypes.node,
}

export default Text
