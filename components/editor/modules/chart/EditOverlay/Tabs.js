import React from 'react'
import { plainButtonRule, fontStyles } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  tab: css({
    margin: '5px 15px 5px 0',
    whiteSpace: 'nowrap',
    ...fontStyles.sansSerifRegular,
    '@media (hover)': {
      ':hover': {
        textDecoration: 'underline'
      }
    },
    '&.is-active': {
      ...fontStyles.sansSerifMedium,
      lineHeight: '16px'
    }
  })
}

export const Tab = ({ tabKey, label, setTab, isActive, style }) => {
  return (
    <button
      {...plainButtonRule}
      {...styles.tab}
      onClick={() => setTab(tabKey)}
      className={isActive ? 'is-active' : ''}
      style={style}
    >
      {label}
    </button>
  )
}
