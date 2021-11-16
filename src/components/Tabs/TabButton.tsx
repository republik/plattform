import React, { ReactNode, useMemo } from 'react'
import { css } from 'glamor'
import { plainButtonRule } from '../Button'
import { useColorContext } from '../Colors/useColorContext'
import { sansSerifMedium16, sansSerifRegular16 } from '../Typography/styles'
import { mUp } from '../../theme/mediaQueries'

export type TabItemType = {
  text: string
  children: ReactNode
  isActive: string
  onClick: () => void
  href: string
}

const styles = {
  tabButton: css({
    padding: '8px 16px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderColor: 'transparent',
    whiteSpace: 'nowrap',
    ...sansSerifRegular16,
    [mUp]: {
      padding: '8px 24px'
    },
    '&::after': {
      display: 'block',
      content: 'attr(title)',
      ...sansSerifMedium16,
      height: '1px',
      color: 'transparent',
      whiteSpace: 'nowrap',
      visibility: 'hidden',
      overflow: 'hidden'
    },
    '&:first-of-type': {
      paddingLeft: '0px'
    },
    '&:last-of-type': {
      paddingRight: '0px',
      [mUp]: {
        paddingRight: '24px'
      }
    }
  }),
  activeItem: css({
    ...sansSerifMedium16
  })
}

const TabButton = React.forwardRef(
  ({ isActive, text, href, onClick }: TabItemType, ref) => {
    const [colorScheme] = useColorContext()

    const hoverRule = useMemo(() => {
      return css({
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('textSoft')
          }
        }
      })
    }, [colorScheme])

    const Element = href ? 'a' : 'button'

    return (
      <Element
        ref={ref}
        href={href}
        onClick={onClick}
        {...css(styles.tabButton, isActive && styles.activeItem)}
        {...plainButtonRule}
        {...(!isActive && hoverRule)}
        {...colorScheme.set('borderColor', isActive ? 'text' : 'divider')}
        title={text}
      >
        {text}
      </Element>
    )
  }
)

export default TabButton
