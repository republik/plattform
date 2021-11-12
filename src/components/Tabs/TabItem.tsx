import React, { useMemo } from 'react'
import { css } from 'glamor'
import { plainButtonRule } from '../Button'
import { useColorContext } from '../Colors/useColorContext'
import { sansSerifMedium16, sansSerifRegular16 } from '../Typography/styles'
import { mUp } from '../../theme/mediaQueries'

export type ItemType = {
  value: string
  text: string
  element?: React.ReactNode
}

export type TabItemType = {
  item: ItemType
  tabWidth: string
  activeValue: string
  tabBorder: boolean
  handleTabClick: () => void
}

const styles = {
  tabItem: css({
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
  fixedItem: css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '&:first-child': {
      paddingLeft: '16px'
    },
    '&:last-of-type': {
      paddingRight: '16px'
    },
    '&::after': {
      display: 'none',
      textOverflow: 'ellipsis'
    }
  }),
  activeItem: css({
    ...sansSerifMedium16
  }),
  elementContainer: css({
    display: 'flex',
    justifyContent: 'center'
  })
}

const TabItem = ({
  activeValue,
  tabWidth,
  item,
  handleTabClick,
  tabBorder
}: TabItemType) => {
  const [colorScheme] = useColorContext()
  const isActive = activeValue === item.value

  const hoverRule = useMemo(() => {
    return css({
      '@media (hover)': {
        ':hover': {
          color: colorScheme.getCSSColor('textSoft')
        }
      }
    })
  }, [colorScheme])

  return (
    <button
      {...css(styles.tabItem, isActive && styles.activeItem)}
      {...plainButtonRule}
      {...(!isActive && hoverRule)}
      {...(tabBorder &&
        colorScheme.set('borderColor', isActive ? 'text' : 'divider'))}
      {...(tabWidth !== 'auto' && styles.fixedItem)}
      style={{ width: tabWidth }}
      title={item.text}
      onClick={() => handleTabClick()}
    >
      {item.element ? (
        <div {...styles.elementContainer}>{item.element}</div>
      ) : (
        item.text
      )}
    </button>
  )
}

export default TabItem
