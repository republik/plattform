import React from 'react'
import Downshift from 'downshift'
import PropTypes from 'prop-types'

import {
  ItemsContainer,
  Items,
  Inner,
  styles,
  itemToString
} from './VirtualDropdown'
import Field from './Field'

const Autocomplete = ({
  items,
  label,
  value,
  onChange,
  filter,
  onFilterChange
}) => {
  return (
    <Downshift
      {...{
        onChange,
        selectedItem: value,
        onInputValueChange: nextFilter =>
          onFilterChange(
            nextFilter || ''
          ),
        itemToString,
        inputValue: filter
      }}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        selectedItem,
        highlightedIndex,
        isOpen
      }) => {
        return (
          <div {...styles.root}>
            <Inner isOpen={isOpen}>
              <Field
                isFocused={isOpen}
                label={label}
                value={filter}
                renderInput={fieldProps => (
                  <input
                    {...getInputProps({
                      ...fieldProps,
                      placeholder: selectedItem
                          ? itemToString(selectedItem)
                          : ''
                    })}
                  />
                )}
              />
              {isOpen &&
              items.length > 0 ? (
                <ItemsContainer
                  isOpen={isOpen}
                >
                  <Items
                    {...{
                      items,
                      selectedItem,
                      highlightedIndex,
                      getItemProps
                    }}
                  />
                </ItemsContainer>
              ) : null}
            </Inner>
          </div>
        )
      }}
    </Downshift>
  )
}

Autocomplete.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.any
    })
  ).isRequired,
  value: PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.any
  }),
  filter: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onFilterChange:
    PropTypes.func.isRequired
}

export default Autocomplete
