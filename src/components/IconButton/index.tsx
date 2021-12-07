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
      fillColorName,
      onClick,
      children,
      style: customStyles,
      size,
      disabled,
      attributes,
      invert
    },
    ref
  ) => {
    const Element = href ? 'a' : 'button'
    const [colorScheme] = useColorContext()

    const fillValue = disabled ? 'disabled' : fill || fillColorName || 'text'

    return (
      <Element
        {...styles.button}
        {...(invert && styles.invertFlex)}
        {...((onClick || href) && styles.hover)}
        {...attributes}
        style={{
          cursor: (href || onClick) && !disabled ? 'pointer' : 'auto',
          ...customStyles
        }}
        onClick={onClick}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener' : ''}
        ref={ref}
        title={title}
        disabled={disabled}
      >
        <Icon
          {...styles.icon}
          size={size || ICON_SIZE}
          {...colorScheme.set('fill', fillValue)}
        />
        {label && (
          <span
            {...styles.label}
            {...styles.long}
            {...colorScheme.set('color', fillValue)}
          >
            {label}
          </span>
        )}
        {labelShort && (
          <span
            {...styles.label}
            {...styles.short}
            {...colorScheme.set('color', fillValue)}
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
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    textDecoration: 'none',
    marginRight: 20,
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
    },
    ':disabled': {
      cursor: 'default'
    },
    '& > *:not(:last-child)': {
      marginRight: 8,
      marginLeft: 0
    }
  }),
  invertFlex: css({
    flexDirection: 'row-reverse',
    '& > *:not(:last-child)': {
      marginRight: 0,
      marginLeft: 8
    }
  }),
  hover: css({
    '@media(hover)': {
      ':hover:not(:disabled) > *': {
        opacity: 0.6
      }
    }
  }),
  label: css({
    ...fontStyles.sansSerifMedium,
    fontSize: 14,
    whiteSpace: 'nowrap'
  }),
  long: css({
    display: 'none',
    [mUp]: {
      display: 'inline'
    }
  }),
  short: css({
    display: 'inline',
    [mUp]: {
      display: 'none'
    }
  })
}

export default IconButton
