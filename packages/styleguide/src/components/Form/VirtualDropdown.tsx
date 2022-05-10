import React, { useState, useEffect, useRef } from 'react'
import { css, merge } from 'glamor'
import Downshift from 'downshift'

import zIndex from '../../theme/zIndex'
import { sansSerifRegular21 } from '../Typography/styles'
import { Label } from './DropdownLabel'
import { LABEL_HEIGHT, FIELD_HEIGHT } from './constants'
import { useColorContext } from '../Colors/useColorContext'
import { DropdownProps } from './Dropdown'
import { ArrowProps } from './Field'

export const styles = {
  root: css({
    position: 'relative',
    minHeight: LABEL_HEIGHT + FIELD_HEIGHT,
    marginBottom: 12,
  }),
  inner: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    margin: '0 -12px',
    padding: '0 12px',
    transition: 'box-shadow .12s, background .12s',
  }),
  innerFocus: css({
    zIndex: zIndex.dropdown,
  }),
  items: css({
    overflow: 'hidden',
    margin: '0 -12px',
    transition: 'opacity .2s, height .12s',
  }),
  item: css({
    ...sansSerifRegular21,
    lineHeight: '27px',
    padding: '17px 12px',
    cursor: 'pointer',
    transition: 'background .12s',
  }),
  itemSeparator: css({
    margin: '-1px 12px 0',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    transition: 'border-color .12s',
  }),
  hiddenItemSeparator: css({
    borderColor: 'transparent',
  }),
  arrowDown: css({
    position: 'absolute',
    right: 0,
    top: 28,
    pointerEvents: 'none',
  }),
}

export const itemToString = (item) => (item ? item.text : null)

export const VirtualDropdown = ({
  label,
  items,
  onChange,
  value,
}: DropdownProps) => {
  const [focus, setFocus] = useState(false)
  const [colorScheme] = useColorContext()
  const selectedItem = items.find((item) => item.value === value)
  return (
    <Downshift
      onChange={onChange}
      itemToString={itemToString}
      selectedItem={selectedItem}
    >
      {({
        getToggleButtonProps,
        getItemProps,
        isOpen,
        inputValue,
        selectedItem,
        highlightedIndex,
      }) => (
        <div {...styles.root}>
          {/* ensure the height for selected multiline values (<Inner> is absolute) */}
          {!!selectedItem && (
            <Label
              Element='button'
              field={true}
              style={{ visibility: 'hidden' }}
            >
              {selectedItem.element || selectedItem.text}
            </Label>
          )}
          <Inner isOpen={isOpen}>
            <Label
              top={!!selectedItem || focus}
              focus={isOpen || focus}
              text={label}
            >
              <Label
                Element='button'
                field={true}
                {...getToggleButtonProps()}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
              >
                {selectedItem ? selectedItem.element || selectedItem.text : ''}
              </Label>
              <ArrowDown
                {...(isOpen || focus
                  ? colorScheme.set('fill', 'primary')
                  : colorScheme.set('fill', 'disabled'))}
                size={30}
              />
            </Label>
            <ItemsContainer isOpen={isOpen}>
              <Items
                items={items}
                selectedItem={selectedItem}
                highlightedIndex={highlightedIndex}
                getItemProps={getItemProps}
              />
            </ItemsContainer>
          </Inner>
        </div>
      )}
    </Downshift>
  )
}

export default VirtualDropdown

export const Inner = ({ isOpen, children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...merge(styles.inner, isOpen && styles.innerFocus)}
      {...(isOpen && colorScheme.set('backgroundColor', 'overlay'))}
      {...(isOpen && colorScheme.set('boxShadow', 'overlayShadow'))}
    >
      {children}
    </div>
  )
}

// This (stateful) component wraps a list of items and adds a fade in/out animation.
export const ItemsContainer = ({ isOpen, children }) => {
  const [height, setHeight] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const refFn = useRef<HTMLDivElement>(null)
  const [colorScheme] = useColorContext()

  useEffect(() => {
    if (refFn.current) {
      const { height } = refFn.current.getBoundingClientRect()
      setHeight(height)
      setOpacity(1)
    }
  }, [refFn])

  const style = isOpen ? { height, opacity } : { height: 0, opacity: 0 }
  return (
    <div {...styles.items} {...colorScheme.set('color', 'text')} style={style}>
      <div ref={refFn}>{children}</div>
    </div>
  )
}

const isSameItem = (itemA, itemB) =>
  itemA === itemB ||
  (itemA &&
    itemB &&
    Object.keys(itemA).every((key) => itemA[key] === itemB[key]))

export const Items = ({
  items,
  selectedItem,
  highlightedIndex,
  getItemProps,
}) =>
  items.map((item, index) => {
    const i = (
      <Item
        key={`item-${index}`}
        selected={isSameItem(item, selectedItem)}
        highlighted={index === highlightedIndex}
        {...getItemProps({ item, index })}
      >
        {item.element || item.text}
      </Item>
    )
    if (index === 0) {
      return i
    }

    return [
      <ItemSeparator
        key={`item-separator-${index}`}
        hidden={
          highlightedIndex !== null &&
          (highlightedIndex === index || highlightedIndex + 1 === index)
        }
      />,
      i,
    ]
  })

const Item = ({ selected, highlighted, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.item}
      {...(selected && colorScheme.set('color', 'primary'))}
      {...(highlighted && colorScheme.set('backgroundColor', 'hover'))}
      {...props}
      onMouseDown={(e) => {
        e.preventDefault()
      }}
    />
  )
}

const ItemSeparator = ({ hidden }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...merge(styles.itemSeparator, hidden && styles.hiddenItemSeparator)}
      {...(!hidden && colorScheme.set('borderColor', 'divider'))}
    />
  )
}

const ArrowDown = ({ size, fill, ...props }: ArrowProps) => (
  <svg
    {...props}
    fill={fill}
    {...styles.arrowDown}
    width={size}
    height={size}
    viewBox='0 0 24 24'
  >
    <path d='M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z' />
  </svg>
)
