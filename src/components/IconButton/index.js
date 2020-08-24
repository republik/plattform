import React from 'react'
import { css } from 'glamor'

import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { fontFamilies } from '../../theme/fonts'

const ICON_SIZE = 24

const IconButton = React.forwardRef(
  (
    {
      Icon,
      href,
      target,
      label,
      labelShort,
      title,
      fill = colors.text,
      onClick,
      children
    },
    ref
  ) => {
    const Element = href ? 'a' : 'button'
    return (
      <Element
        {...styles.button}
        {...((onClick || href) && styles.hover)}
        style={{ cursor: !onClick ? 'auto' : 'pointer' }}
        onClick={onClick}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener' : ''}
        ref={ref}
        title={title}
      >
        <Icon {...styles.icon} size={ICON_SIZE} fill={fill} />
        {label && (
          <span
            {...styles.label}
            {...styles.long}
            style={fill && { color: fill }}
          >
            {label}
          </span>
        )}
        {labelShort && (
          <span
            {...styles.label}
            {...styles.short}
            style={fill && { color: fill }}
          >
            {labelShort}
          </span>
        )}
        {children}
      </Element>
    )
  }
)

const styles = {
  button: css({
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    textDecoration: 'none',
    marginRight: 18,
    border: 0,
    padding: 0,
    color: 'inherit',
    backgroundColor: 'transparent',
    transition: 'opacity 0.3s',
    ':last-child': {
      marginRight: 0
    },
    ':only-child': {
      margin: 0
    },
    [mUp]: {
      marginRight: 24
    }
  }),
  hover: css({
    '@media(hover)': {
      ':hover > *': {
        opacity: 0.6
      }
    }
  }),
  label: css({
    fontFamily: fontFamilies.sansSerifMedium,
    letterSpacing: 1,
    fontSize: 12,
    marginLeft: 8,
    whiteSpace: 'nowrap'
  }),
  long: css({
    display: 'none',
    [mUp]: {
      display: 'initial'
    }
  }),
  short: css({
    display: 'initial',
    [mUp]: {
      display: 'none'
    }
  })
}

export default IconButton
