import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Autocomplete from 'react-autocomplete'
import * as colors from '../../theme/colors'
import Field, {fieldHeight} from './Field'

const sortItems = (a, b, value) => {
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()
  const valueLower = value.toLowerCase()
  const queryPosA = aLower.indexOf(valueLower)
  const queryPosB = bLower.indexOf(valueLower)
  if (queryPosA !== queryPosB) {
    return queryPosA - queryPosB
  }
  return aLower < bLower ? -1 : 1
}
const filterItems = (items, value) => {
  const valueLower = value.toLowerCase()
  return items
    .filter(item => (
      item.toLowerCase().indexOf(valueLower) !== -1
    ))
}

class AutosuggestField extends Component {
  constructor (props, context) {
    super(props, context)
    this.inputRef = ref => this.input = ref
  }
  render () {
    const {
      items,
      ...fieldProps
    } = this.props
    return (
      <Field
        {...fieldProps}
        ref={this.inputRef}
        renderInput={({value, onChange, ...props}) => (
          <Autocomplete
            value={value}
            inputProps={props}
            onChange={onChange}
            onSelect={(value, item) => onChange({
              target: {
                value: item
              }
            })}
            items={filterItems(items, value)}
            sortItems={sortItems}
            getItemValue={item => item}
            wrapperStyle={{position: 'relative'}}
            renderMenu={(items) => (
              <div
                onMouseDown={e => {e.preventDefault()}}
                onClick={e => {e.preventDefault()}}
                style={{position: 'absolute', zIndex: 1, backgroundColor: 'white', top: fieldHeight, left: 0, width: '100%'}}>
                {items}
              </div>
            )}
            renderItem={(item, isHighlighted) => (
              <div key={item}
                style={{
                  backgroundColor: isHighlighted ? colors.primaryBg : '',
                  borderBottom: '1px solid #ccc',
                  padding: '6px 0'
                }}>
                {item}
              </div>
            )} />
        )} />
    )
  }
}

AutosuggestField.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.string.isRequired
}

export default AutosuggestField
