import React from 'react'
import { chartTypes } from './config'
import { Tab } from './Tabs'
import { css } from 'glamor'

const styles = {
  tabContainer: css({})
}

const TypeSelector = ({ selected, select }) => {
  return (
    <div {...styles.tabContainer}>
      {chartTypes.map(({ label, value }) => (
        <Tab
          key={value || label}
          tabKey={value}
          label={label}
          setTab={select}
          isActive={value === selected}
          style={{ marginRight: 30 }}
        />
      ))}
    </div>
  )
}

export default TypeSelector
