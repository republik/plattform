import React, {PureComponent} from 'react'
import {Label, LSelect} from './Label'

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

    this.onChange = (ev) => {
      const {items, onChange} = this.props
      const value = ev.target.value
      const item = items.find(item => item.id === value)
      if (onChange && item) {
        onChange(item)
      }
    }
  }

  render () {
    const {label, items, defaultSelectedItem} = this.props
    const {focus} = this.state
    const value = defaultSelectedItem ? defaultSelectedItem.id : null

    return (
      <Label top={true} focus={focus} text={label}>
        <LSelect value={value} onChange={this.onChange} onFocus={this.onFocus} onBlur={this.onBlur}>
          {items.map((item, index) => (
            <option key={index} value={item.id}>
              {item.text}
            </option>
          ))}
        </LSelect>
      </Label>
    )
  }
}

export default NativeDropdown
