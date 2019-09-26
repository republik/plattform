import React, {PureComponent} from 'react'
import {Label, LSelect, LSpan} from './Label'

export class NativeDropdown extends PureComponent {
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
    const {label, items, value, white, black, onChange} = this.props
    const {focus} = this.state
    const selectedItem = items.find(item => item.value === value)

    return (
      <Label top={!!selectedItem || focus} focus={focus} text={label} white={white} black={black}>
        {/* ensure the height for selected multiline values (<Inner> is absolute) */}
        <LSpan>
          {selectedItem ? (selectedItem.element || selectedItem.text) : ''}
        </LSpan>
        <LSelect
          value={value}
          onChange={onChange && ((e) => onChange(items.find(item => item.value === e.target.value)))}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          white={white} black={black}>
          {items.map((item, index) => (
            <option key={index} value={item.value}>
              {item.text}
            </option>
          ))}
        </LSelect>
      </Label>
    )
  }
}

export default NativeDropdown
