import React, { Component } from 'react'
import { ChromePicker } from 'react-color'
import { Label } from '@project-r/styleguide'

const styles = {
  popover: {
    position: 'absolute',
    zIndex: '2'
  },
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px'
  },
  button: {
    display: 'inline-block',
    width: '30px',
    height: '30px',
    border: '1px solid #000',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 15,
    padding: '7px 6px'
  }
}

class ColorPicker extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      displayColorPicker: false
    }
    this.clickHandler = this.clickHandler.bind(this)
    this.closeHandler = this.closeHandler.bind(this)
  }

  clickHandler() {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  }

  closeHandler() {
    this.setState({ displayColorPicker: false })
  }

  render() {
    return (
      <div style={{ marginBottom: 5 }}>
        <Label>{this.props.label}</Label>
        <div>
          <span
            onClick={this.clickHandler}
            style={{
              backgroundColor: this.props.value,
              ...styles.button
            }}
          >
            {!this.props.value && '❌'}
          </span>
          {!!this.props.value && (
            <span
              onClick={() => {
                this.props.onChange(undefined)
              }}
              style={{
                ...styles.button,
                borderColor: 'transparent'
              }}
            >
              ❌
            </span>
          )}
        </div>
        {this.state.displayColorPicker && (
          <div style={styles.popover}>
            <div style={styles.cover} onClick={this.closeHandler} />
            <ChromePicker
              color={this.props.value || '#7C7070'}
              onChange={value => {
                this.props.onChange(value.hex)
              }}
            />
          </div>
        )}
      </div>
    )
  }
}

export default ColorPicker
