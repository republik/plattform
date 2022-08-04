import React, { MouseEventHandler, ReactNode, useMemo } from 'react'
import { css } from 'glamor'
import { plainButtonRule } from '../Button'
import { plainLinkRule } from '../Typography'
import { useColorContext } from '../Colors/ColorContext'
import { sansSerifMedium16, sansSerifRegular16 } from '../Typography/styles'
import { mUp } from '../../theme/mediaQueries'
import { AccessibilityStyles } from '../../lib/accessibility/styles'

export type TabItemType = {
  text: string
  children?: ReactNode
  isActive?: boolean
  onClick?: () => void
  href?: string
  border?: boolean
  // Text to be shown behind the text of the selected tab
  // to indicate selected state to screen-readers
  srSelectedText?: string
}

const styles = {
  default: css({
    padding: '8px 16px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    whiteSpace: 'nowrap',
    ...sansSerifRegular16,
    [mUp]: {
      padding: '8px 24px',
    },
    '&::after': {
      display: 'block',
      content: 'attr(title)',
      ...sansSerifMedium16,
      height: '1px',
      color: 'transparent',
      whiteSpace: 'nowrap',
      visibility: 'hidden',
      overflow: 'hidden',
    },
    '&:first-of-type': {
      paddingLeft: '0px',
    },
    '&:last-of-type': {
      paddingRight: '0px',
      [mUp]: {
        paddingRight: '24px',
      },
    },
  }),
  link: css({
    ...plainLinkRule,
  }),
  active: css({
    ...sansSerifMedium16,
  }),
}

const TabButton = React.forwardRef<
  HTMLAnchorElement & HTMLButtonElement,
  {
    border?: boolean
    isActive?: boolean
    text?: string
    href?: string
    onClick?: MouseEventHandler<HTMLAnchorElement & HTMLButtonElement>
    // Text to be shown behind the text of the selected tab
    // to indicate selected state to screen-readers
    srSelectedText?: string
  }
>(
  (
    {
      border = true,
      isActive,
      text,
      srSelectedText,
      href,
      onClick,
    }: TabItemType,
    ref,
  ) => {
    const [colorScheme] = useColorContext()

    const hoverRule = useMemo(() => {
      return css({
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('textSoft'),
          },
        },
      })
    }, [colorScheme])

    const Element = href ? 'a' : 'button'

    return (
      <Element
        ref={ref}
        href={href}
        onClick={onClick}
        {...css(styles.default, isActive && styles.active, href && styles.link)}
        {...plainButtonRule}
        {...(!isActive && hoverRule)}
        {...colorScheme.set(
          'borderColor',
          !border ? 'transparent' : isActive ? 'text' : 'divider',
        )}
        title={text}
        role='tab'
        aria-selected={isActive}
      >
        {text}
        {isActive && srSelectedText && (
          <span {...AccessibilityStyles.srOnly}>{srSelectedText}</span>
        )}
      </Element>
    )
  },
)

export default TabButton
