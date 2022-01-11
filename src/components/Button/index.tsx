import React, { Attributes, MouseEventHandler, useMemo } from 'react'
import { css, merge, simulate } from 'glamor'
import { fontStyles } from '../../theme/fonts'
import { pxToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/ColorContext'

export const plainButtonRule = css({
  fontFamily: 'inherit',
  fontWeight: 'inherit',
  fontStyle: 'inherit',
  color: 'inherit',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  outline: 'none',
  appearance: 'none',
  padding: 0
})

const styles = {
  default: css(plainButtonRule, {
    verticalAlign: 'bottom',
    padding: '10px 20px 10px 20px',
    minWidth: 160,
    textAlign: 'center',
    textDecoration: 'none',
    fontSize: pxToRem(22),
    height: pxToRem(60),
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    ...fontStyles.sansSerifRegular,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 0
  }),
  link: css({
    display: 'inline-block',
    verticalAlign: 'middle',
    lineHeight: 1.5,
    height: 'inherit',
    minHeight: pxToRem(60)
  }),
  block: css({
    display: 'block',
    width: '100%'
  }),
  small: css({
    fontSize: pxToRem(16),
    height: pxToRem(32),
    minWidth: 0,
    padding: '0 16px 0 16px'
  }),
  naked: css({
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent'
  })
}

const Button = React.forwardRef<
  HTMLAnchorElement & HTMLButtonElement,
  {
    onClick?: MouseEventHandler<HTMLAnchorElement & HTMLButtonElement>
    type?: 'button' | 'submit' | 'reset'
    primary?: boolean
    big?: boolean
    block?: boolean
    disabled?: boolean
    href?: string
    title?: string
    target?: string
    style?: React.CSSProperties
    simulate?: string
    attributes?: Attributes
    naked?: boolean
    small?: boolean
  }
>(
  (
    {
      onClick,
      type,
      children,
      primary,
      block,
      style,
      disabled,
      href,
      title,
      target,
      simulate: sim,
      attributes,
      naked,
      small
    },
    ref
  ) => {
    const [colorScheme] = useColorContext()
    const buttonStyleRules = useMemo(
      () =>
        css({
          backgroundColor: colorScheme.getCSSColor(
            primary ? 'primary' : 'transparent'
          ),
          borderColor: colorScheme.getCSSColor(primary ? 'primary' : 'text'),
          color: colorScheme.getCSSColor(
            naked && primary ? 'primary' : primary ? '#FFF' : 'text'
          ),
          '@media (hover)': {
            ':hover': {
              backgroundColor: colorScheme.getCSSColor('primaryHover'),
              borderColor: colorScheme.getCSSColor('primaryHover'),
              color: colorScheme.getCSSColor(
                naked && primary ? 'primaryHover' : naked ? 'textSoft' : '#FFF'
              )
            }
          },
          ':active': {
            backgroundColor: colorScheme.getCSSColor('primaryHover'),
            borderColor: colorScheme.getCSSColor('primaryHover'),
            color: colorScheme.getCSSColor(
              naked && primary ? 'primaryHover' : naked ? 'textSoft' : '#FFF'
            )
          },
          ':disabled, [disabled]': {
            backgroundColor: 'transparent',
            cursor: 'default',
            color: colorScheme.getCSSColor('disabled'),
            borderColor: colorScheme.getCSSColor('disabled'),
            '@media (hover)': {
              ':hover': {
                backgroundColor: 'transparent',
                color: colorScheme.getCSSColor('disabled'),
                borderColor: colorScheme.getCSSColor('disabled')
              }
            }
          }
        }),

      [colorScheme, primary, naked]
    )
    const simulations = sim ? simulate(sim) : {}
    const buttonStyles = merge(
      styles.default,
      buttonStyleRules,
      href && styles.link,
      block && styles.block,
      small && styles.small,
      naked && styles.naked
    )

    const Element = href ? 'a' : 'button'

    return (
      <Element
        ref={ref}
        onClick={onClick}
        href={href}
        title={title}
        type={type}
        style={style}
        disabled={disabled}
        target={target}
        {...attributes}
        {...buttonStyles}
        {...simulations}
      >
        {children}
      </Element>
    )
  }
)

export default Button
