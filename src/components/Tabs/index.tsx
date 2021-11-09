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
  value: string
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
  value,
  onChange,
  dropDownlabel
}: TabsType) => {
  const isDesktop = useMediaQuery(mUp)

  const Items = items.map((item, index) => {
    const itemWidth = type === 'fixed' ? `${100 / items.length}%` : 'auto'
    return (
      <TabItem
        itemWidth={itemWidth}
        key={item.value}
        item={item}
        value={value}
        handleTabClick={() => onChange(item)}
      />
    )
  })

  switch (type) {
    case 'scroll':
      return <Scroller arrowSize={28}>{Items}</Scroller>
    case 'dropdown': {
      if (isDesktop) {
        return <Scroller arrowSize={28}>{Items}</Scroller>
      } else {
        return (
          <Dropdown
            items={items}
            value={value}
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
