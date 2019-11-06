import React, { Component } from 'react'
import { css } from 'glamor'
import MaskedInput from 'react-maskedinput'

import { displayDateTime } from './Table'
import { timeParse, timeFormat } from 'd3-time-format'

const loading = css.keyframes({
  'from, to': {
    opacity: 0.5
  },
  '50%': {
    opacity: 1
  }
})

const styles = {
  span: css({
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    height: 16
  }),
  mask: css({
    outline: 'none',
    border: 'none',
    backgroundColor: 'transparent',
    font: 'inherit',
    marginRight: -10,
    '::placeholder': {
      color: '#ccc'
    },
    '[disabled]': {
      animation: `0.4s ${loading} infinite ease-in-out`
    }
  })
}

const dateFormat = '%d.%m.%y %H:%M'
const dateMask = dateFormat.replace('%Y', '1111').replace(/%(d|m|y|H|M)/g, '11')
const parseDate = timeParse(dateFormat)
const formatDate = timeFormat(dateFormat)

class EditMeta extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      editing: false,
      disabled: false,
      value: undefined
    }
    this.setRef = ref => {
      this.ref = ref
    }
  }
  render() {
    const { editing, disabled } = this.state
    const { value, onChange } = this.props

    const formattedPropValue = value ? formatDate(new Date(value)) : ''
    let formattedValue =
      this.state.value !== undefined ? this.state.value : formattedPropValue

    return (
      <span
        {...styles.span}
        onClick={() => {
          this.setState({ editing: true }, () => {
            this.ref.focus()
          })
        }}
      >
        {editing ? (
          <MaskedInput
            value={formattedValue}
            disabled={disabled}
            ref={this.setRef}
            {...styles.mask}
            onKeyUp={event => {
              if (event.key === 'Enter') {
                const parsedValue = parseDate(formattedValue)
                if (!parsedValue && formattedValue !== '') {
                  return
                }
                if (formattedPropValue === formattedValue) {
                  this.ref.blur()
                }

                this.setState({ disabled: true })
                onChange(parsedValue ? parsedValue.toISOString() : null)
                  .then(() => {
                    this.setState({
                      editing: false,
                      value: undefined,
                      disabled: false
                    })
                  })
                  .catch(() => {
                    this.setState({ disabled: false })
                  })
                this.ref.blur()
              }
              if (event.key === 'Escape') {
                this.setState({
                  editing: false,
                  value: undefined,
                  disabled: false
                })
              }
            }}
            onBlur={() => {
              if (formattedPropValue === formattedValue) {
                this.setState({ editing: false, value: undefined })
              }
            }}
            onChange={event => this.setState({ value: event.target.value })}
            placeholderChar={'_'}
            mask={dateMask}
          />
        ) : (
          displayDateTime(value)
        )}
      </span>
    )
  }
}

export default EditMeta
