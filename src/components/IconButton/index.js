import React from 'react'
import { css } from 'glamor'

import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../../theme/fonts'
import { useColorContext } from '../Colors/useColorContext'

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
      fill,
      onClick,
      children,
      style
    },
    ref
  ) => {
    const Element = href ? 'a' : 'button'
    const customStyles = style || null
    const [colorScheme] = useColorContext()

    return (
      <Element
        {...styles.button}
        {...((onClick || href) && styles.hover)}
        style={{
          cursor: href || onClick ? 'pointer' : 'auto',
          ...customStyles
        }}
        onClick={onClick}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener' : ''}
        ref={ref}
        title={title}
      >
        <Icon
          {...styles.icon}
          size={ICON_SIZE}
          fill={fill || colorScheme.text}
        />
        {label && (
          <span
            {...styles.label}
            {...styles.long}
            style={{ color: fill || colorScheme.text }}
          >
            {label}
          </span>
        )}
        {labelShort && (
          <span
            {...styles.label}
            {...styles.short}
            style={{ color: fill || colorScheme.text }}
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
    ':focus': {
      outline: 'none'
    },
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
    ...fontStyles.sansSerifMedium,
    fontSize: 14,
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
