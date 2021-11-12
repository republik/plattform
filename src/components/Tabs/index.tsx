import Scroller from '../Scroller'
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
  scrollBreakoutWidth: number
  tabBorder: boolean
  borderBottom: boolean
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
  scrollBreakoutWidth = 0,
  scrollHideArrows = false,
  tabBorder = true
}: TabsType) => {
  const isDesktop = useMediaQuery(mUp)
  const activeScrollItemIndex = items.findIndex(
    item => item.value === activeValue
  )

  const Items = items.map((item, index) => {
    const itemWidth = type === 'fixed' ? `${100 / items.length}%` : 'auto'
    return (
      <TabItem
        tabWidth={itemWidth}
        key={item.value}
        item={item}
        tabBorder={tabBorder}
        activeValue={activeValue}
        handleTabClick={() => onChange(item)}
      />
    )
  })

  switch (type) {
    case 'scroll':
      return (
        <Scroller
          center={scrollCentered}
          breakoutWidth={scrollBreakoutWidth}
          hideArrows={scrollHideArrows}
          activeScrollItemIndex={activeScrollItemIndex}
        >
          {Items}
        </Scroller>
      )
    case 'dropdown': {
      if (isDesktop) {
        return (
          <Scroller
            center={scrollCentered}
            breakoutWidth={scrollBreakoutWidth}
            hideArrows={scrollHideArrows}
            activeScrollItemIndex={activeScrollItemIndex}
          >
            {Items}
          </Scroller>
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
