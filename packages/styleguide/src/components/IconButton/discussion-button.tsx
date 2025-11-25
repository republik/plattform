import { css } from 'glamor'
import React, {
  Attributes,
  ComponentType,
  MouseEventHandler,
  ReactNode,
  SVGProps,
  useMemo,
} from 'react'
import { fontStyles } from '../../theme/fonts'

import { mUp } from '../../theme/mediaQueries'
import { useColorContext } from '../Colors/ColorContext'

const ICON_SIZE = 24

const DisucssionIconButton = React.forwardRef<
  HTMLAnchorElement & HTMLButtonElement,
  {
    children?: ReactNode
    Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>
    href?: string
    target?: string
    label?: string
    labelShort?: string
    title?: string
    fill?: string
    fillColorName?: string
    onClick?: MouseEventHandler<HTMLAnchorElement & HTMLButtonElement>
    onMouseDown?: MouseEventHandler<HTMLAnchorElement & HTMLButtonElement>
    style?: React.CSSProperties
    size?: number
    disabled?: boolean
    attributes?: Attributes
    invert?: boolean
    active?: boolean
    strokeWidth?: number | string
  }
>(
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
      onMouseDown,
      children,
      style: customStyles,
      size,
      disabled,
      attributes,
      invert,
      active,
      strokeWidth,
    },
    ref,
  ) => {
    const Element = href ? 'a' : 'button'
    const [colorScheme] = useColorContext()

    const fillValue = fill || fillColorName
    const doesSomething = (href || onClick || onMouseDown) && !disabled

    const dynamicStyles = useMemo(
      () =>
        !doesSomething
          ? css({
              color: colorScheme.getCSSColor(fill || 'disabled'),
              fill: colorScheme.getCSSColor(fill || 'disabled'),
              opacity: 0.7,
            })
          : css({
              color: colorScheme.getCSSColor(fillValue || 'textSoft'),
              fill: colorScheme.getCSSColor(fillValue || 'textSoft'),
              cursor: 'pointer',
              '@media (hover)': {
                ':hover': {
                  color: colorScheme.getCSSColor(fillValue || 'text'),
                  fill: colorScheme.getCSSColor(fillValue || 'text'),
                },
              },
              '&.active': {
                color: colorScheme.getCSSColor(fillValue || 'text'),
                fill: colorScheme.getCSSColor(fillValue || 'text'),
              },
            }),
      [colorScheme, fillValue, doesSomething],
    )

    return (
      <Element
        {...styles.button}
        {...(invert && styles.invertFlex)}
        {...attributes}
        style={{
          ...customStyles,
        }}
        className={active ? 'active' : ''}
        onClick={onClick}
        onMouseDown={onMouseDown}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noreferrer' : ''}
        ref={ref}
        title={title}
        disabled={disabled}
        {...dynamicStyles}
      >
        <Icon
          size={size || ICON_SIZE}
          width={size || ICON_SIZE}
          height={size || ICON_SIZE}
          strokeWidth={strokeWidth}
        />
        {label && (
          <span {...styles.label} {...styles.long}>
            {label}
          </span>
        )}
        {labelShort && (
          <span {...styles.label} {...styles.short}>
            {labelShort}
          </span>
        )}
        {children}
      </Element>
    )
  },
)

const styles = {
  button: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
    marginRight: 16,
    border: 0,
    padding: 0,
    color: 'inherit',
    backgroundColor: 'transparent',
    ':focus': {
      outline: 'none',
    },
    ':last-child': {
      marginRight: 0,
    },
    ':only-child': {
      margin: 0,
    },
    ':disabled': {
      cursor: 'default',
    },
    '& > *:not(:last-child)': {
      marginRight: 4,
      marginLeft: 0,
    },
  }),
  invertFlex: css({
    flexDirection: 'row-reverse',
    '& > *:not(:last-child)': {
      marginRight: 0,
      marginLeft: 4,
    },
  }),
  label: css({
    ...fontStyles.sansSerifRegular,
    fontSize: 14,
    whiteSpace: 'nowrap',
  }),
  long: css({
    display: 'none',
    [mUp]: {
      display: 'inline',
    },
  }),
  short: css({
    display: 'inline',
    [mUp]: {
      display: 'none',
    },
  }),
}

export default DisucssionIconButton
