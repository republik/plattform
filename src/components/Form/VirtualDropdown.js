import React, {PureComponent} from 'react'
import {css, merge} from 'glamor'
import Downshift from 'downshift'

import zIndex from '../../theme/zIndex'
import colors from '../../theme/colors'
import {sansSerifRegular21} from '../Typography/styles'
import {labelHeight, fieldHeight, Label, LButton} from './Label'

export const styles = {
  root: css({
    position: 'relative',
    height: labelHeight + fieldHeight,
    marginBottom: 12
  }),
  inner: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    margin: '0 -12px',
    padding: '0 12px',
    background: 'transparent',
    transition: 'box-shadow .12s, background .12s'
  }),
  innerFocus: css({
    zIndex: zIndex.dropdown,
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,.2)'
  }),
  items: css({
    overflow: 'hidden',
    margin: '0 -12px',
    transition: 'opacity .2s, height .12s'
  }),

  item: css({
    ...sansSerifRegular21,
    color: colors.text,
    lineHeight: 1,
    padding: '17px 12px',
    cursor: 'pointer',
    transition: 'background .12s'
  }),
  selectedItem: css({
    color: colors.primary
  }),
  highlightedItem: css({
    background: colors.secondaryBg
  }),

  itemSeparator: css({
    margin: '-1px 12px 0',
    borderTop: `1px solid ${colors.divider}`,
    transition: 'border-color .12s'
  }),
  hiddenItemSeparator: css({
    borderColor: 'transparent'
  }),

  arrowDown: css({
    position: 'absolute',
    right: 0,
    top: 28,
    pointerEvents: 'none'
  })
}

export const itemToString = item => item ? item.text : null

export class VirtualDropdown extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      focus: false
    }

    this.onFocus = () => {
      this.setState({focus: true})
    }
    this.onBlur = () => {
      this.setState({focus: false})
    }
  }

  render () {
    const {label, items, onChange, value} = this.props
    const {focus} = this.state
    const selectedItem = items.find(item => item.value === value)

    return (
      <Downshift onChange={onChange} itemToString={itemToString} selectedItem={selectedItem}>
        {renderDropdown({
          label,
          items,
          focus,
          onFocus: this.onFocus,
          onBlur: this.onBlur
        })}
      </Downshift>
    )
  }
}

export default VirtualDropdown

const renderDropdown = ({label, focus, items, onFocus, onBlur}) => ({getButtonProps, getItemProps, isOpen, inputValue, selectedItem, highlightedIndex}) => (
  <div {...styles.root}>
    <Inner isOpen={isOpen}>
      <Label top={!!selectedItem} focus={isOpen || focus} text={label}>
        <LButton {...getButtonProps()} onFocus={onFocus} onBlur={onBlur}>
          {selectedItem ? selectedItem.text : ''}
        </LButton>
        <ArrowDown
          fill={(isOpen || focus) ? colors.primary : colors.disabled}
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
)

export const Inner = ({isOpen, children}) =>
  <div {...merge(styles.inner, isOpen && styles.innerFocus)}>{children}</div>

// This (stateful) component wraps a list of items and adds a fade in/out animation.
export class ItemsContainer extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {height: 0, opacity: 0}
    this.refFn = (ref) => { this.ref = ref }
  }

  updateHeight () {
    if (this.ref) {
      const {height} = this.ref.getBoundingClientRect()
      this.setState({height, opacity: 1})
    }
  }

  componentDidUpdate () {
    this.updateHeight()
  }

  componentDidMount () {
    this.updateHeight()
  }

  render () {
    const style = this.props.isOpen ? this.state : {height: 0, opacity: 0}

    return (
      <div {...styles.items} style={style}>
        <div ref={this.refFn}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

const isSameItem = (itemA, itemB) =>
  itemA === itemB ||
  (
    itemA &&
    itemB &&
    Object.keys(itemA).every(key => itemA[key] === itemB[key])
  )

export const Items = ({items, selectedItem, highlightedIndex, getItemProps}) => items.map((item, index) => {
  const i = (
    <Item
      key={`item-${index}`}
      selected={isSameItem(item, selectedItem)}
      highlighted={index === highlightedIndex}
      {...getItemProps({item, index})}
    >
      {item.text}
    </Item>
  )
  if (index === 0) {
    return i
  }

  return [
    <ItemSeparator
      key={`item-separator-${index}`}
      hidden={highlightedIndex !== null && (highlightedIndex === index || highlightedIndex + 1 === index)}
    />,
    i
  ]
})

const Item = ({selected, highlighted, ...props}) =>
  <div
    {...merge(styles.item, selected && styles.selectedItem, highlighted && styles.highlightedItem)}
    {...props}
    onMouseDown={e => {e.preventDefault()}}
  />

const ItemSeparator = ({hidden}) =>
  <div
    {...merge(styles.itemSeparator, hidden && styles.hiddenItemSeparator)}
  />

const ArrowDown = ({size, fill, ...props}) => (
  <svg {...props} fill={fill} {...styles.arrowDown} width={size} height={size} viewBox='0 0 24 24'>
    <path d='M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z' />
  </svg>
)
