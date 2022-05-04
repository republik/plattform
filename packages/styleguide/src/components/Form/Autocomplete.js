import React from 'react'
import Downshift from 'downshift'
import PropTypes from 'prop-types'

import {
  ItemsContainer,
  Items,
  Inner,
  styles,
  itemToString,
} from './VirtualDropdown'
import Field from './Field'

const Autocomplete = ({
  items,
  label,
  value,
  onChange,
  filter,
  onFilterChange,
  icon,
  autoComplete,
  autoFocus = false,
}) => {
  return (
    <Downshift
      {...{
        onChange,
        selectedItem: value,
        onInputValueChange: (nextFilter) => onFilterChange(nextFilter || ''),
        itemToString,
        inputValue: filter,
      }}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        selectedItem,
        highlightedIndex,
        isOpen,
        openMenu,
      }) => {
        return (
          <div {...styles.root}>
            <Inner isOpen={isOpen}>
              <Field
                label={label}
                value={isOpen ? filter : (value && value.text) || ''}
                icon={icon}
                renderInput={(fieldProps) => (
                  <input
                    {...getInputProps({
                      ...fieldProps,
                      onFocus: (...args) => {
                        if (fieldProps.onFocus) {
                          fieldProps.onFocus(...args)
                        }
                        if (items.length > 1) {
                          openMenu(...args)
                        }
                      },
                      onClick: (...args) => {
                        if (items.length > 1) {
                          openMenu(...args)
                        }
                      },
                      autoComplete,
                      autoFocus,
                      placeholder: selectedItem
                        ? itemToString(selectedItem)
                        : '',
                    })}
                  />
                )}
              />
              {isOpen && items.length > 0 ? (
                <ItemsContainer isOpen={isOpen}>
                  <Items
                    {...{
                      items,
                      selectedItem,
                      highlightedIndex,
                      getItemProps,
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
      value: PropTypes.any,
    }),
  ).isRequired,
  value: PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.any,
  }),
  filter: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  icon: PropTypes.object,
  autoComplete: PropTypes.string,
}

Autocomplete.defaultProps = {
  autoComplete: 'off',
}

export default Autocomplete
