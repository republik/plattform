import React, { Component } from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'

import AutosizeInput from 'react-textarea-autosize'

import { Field } from '@project-r/styleguide'

const styles = {
  autoSize: css({
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important'
  })
}

export const renderAutoSize = ({ onBlur, onPaste } = {}) => ({
  ref,
  onBlur: fieldOnBlur,
  ...inputProps
}) => (
  <AutosizeInput
    {...styles.autoSize}
    {...inputProps}
    onBlur={e => {
      onBlur && onBlur(e)
      fieldOnBlur && fieldOnBlur(e)
    }}
    onPaste={onPaste}
    inputRef={ref}
  />
)

class JSONField extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      value: undefined
    }
    this.renderInput = renderAutoSize({
      onBlur: e => {
        const value = e.target.value
        if (!value) {
          return
        }
        let data
        try {
          data = JSON.parse(value)
        } catch (e) {}
        if (data) {
          this.setState({
            value: undefined
          })
        }
      }
    })
  }
  render() {
    const { label, value, onChange } = this.props
    const stateValue = this.state.value
    return (
      <Field
        label={label}
        value={
          stateValue === undefined ? JSON.stringify(value, null, 2) : stateValue
        }
        renderInput={this.renderInput}
        onChange={(_, value) => {
          let data
          try {
            data = JSON.parse(value)
          } catch (e) {}
          if (data) {
            onChange(data)
          }

          if (this.state.value !== value) {
            this.setState({ value })
          }
        }}
      />
    )
  }
}

JSONField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired
}

export default JSONField
