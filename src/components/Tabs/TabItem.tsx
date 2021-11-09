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
  itemWidth: string
  value: string
  handleTabClick: () => void
}

const styles = {
  tabItem: css({
    padding: '8px 16px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
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
    '&:first-child': {
      paddingLeft: '0px',
      [mUp]: {
        paddingLeft: '24px'
      }
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
    '&::after': {
      display: 'none',
      textOverflow: 'ellipsis'
    }
  })
}

const TabItem = ({ value, itemWidth, item, handleTabClick }: TabItemType) => {
  const [colorScheme] = useColorContext()
  const isActive = value === item.value

  const borderRule = useMemo(() => {
    return {
      activeButton: css({
        ...sansSerifMedium16,
        borderBottomColor: colorScheme.getCSSColor('text')
      }),
      defaultButton: css({
        borderBottomColor: colorScheme.getCSSColor('divider')
      })
    }
  }, [colorScheme])
  return (
    <button
      {...plainButtonRule}
      {...styles.tabItem}
      {...(isActive ? borderRule.activeButton : borderRule.defaultButton)}
      {...(itemWidth !== 'auto' && styles.fixedItem)}
      style={{ width: itemWidth }}
      title={item.text}
      onClick={() => handleTabClick()}
    >
      {item.element || item.text}
    </button>
  )
}

export default TabItem
