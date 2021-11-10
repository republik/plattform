import TabScroller from './TabScroller'
import React from 'react'
import { css } from 'glamor'
import TabItem, { ItemType } from './TabItem'
import { mUp } from '../../theme/mediaQueries'
import { useMediaQuery } from '../../lib/useMediaQuery'
import Dropdown from '../Form/Dropdown'

type TabsType = {
  items: ItemType[]
  onChange: (item: ItemType) => void
  type: 'scroll' | 'dropdown' | 'fixed'
  dropDownlabel: string
  activeValue: string
  scrollCentered: boolean
  scrollFullWidth: boolean
  scrollHideArrows: boolean
}

const styles = {
  fixedContainer: css({
    width: '100%',
    display: 'flex',
    '> *': {
      flex: 1
    }
  })
}

const Tabs = ({
  type = 'scroll',
  items,
  activeValue,
  onChange,
  dropDownlabel,
  scrollCentered = false,
  scrollFullWidth = false,
  scrollHideArrows = false
}: TabsType) => {
  const isDesktop = useMediaQuery(mUp)

  const Items = items.map((item, index) => {
    const itemWidth = type === 'fixed' ? `${100 / items.length}%` : 'auto'
    return (
      <TabItem
        tabWidth={itemWidth}
        key={item.value}
        item={item}
        activeValue={activeValue}
        handleTabClick={() => onChange(item)}
      />
    )
  })

  switch (type) {
    case 'scroll':
      return (
        <TabScroller
          centered={scrollCentered}
          fullWidth={scrollFullWidth}
          hideArrows={scrollHideArrows}
        >
          {Items}
        </TabScroller>
      )
    case 'dropdown': {
      if (isDesktop) {
        return (
          <TabScroller
            centered={scrollCentered}
            fullWidth={scrollFullWidth}
            hideArrows={scrollHideArrows}
          >
            {Items}
          </TabScroller>
        )
      } else {
        return (
          <Dropdown
            items={items}
            value={activeValue}
            label={dropDownlabel}
            onChange={onChange}
          />
        )
      }
    }
    case 'fixed':
      return <div {...styles.fixedContainer}>{Items}</div>
  }
}

export default Tabs
