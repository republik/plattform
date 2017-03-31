import React, {Component} from 'react'
import {css, merge, simulate} from 'glamor'
import * as colors from '../../theme/colors'

const xPadding = 0
const yPadding = 9
const borderWidth = 1
const lineHeight = 20

const fieldStyle = css({
  width: '100%',
  appearance: 'none',
  outline: 'none',
  verticalAlign: 'bottom',
  padding: `${yPadding}px ${xPadding}px`,
  textDecoration: 'none',
  height: 40,
  fontSize: 22,
  boxSizing: 'border-box',
  backgroundColor: 'white',
  border: 'none',
  borderBottom: `solid ${colors.disabled} ${borderWidth}px`,
  color: colors.text,
  ':focus': {
    borderColor: colors.primary
  }
})
const fieldErrorStyle = css({
  borderColor: colors.error,
  ':focus': {
    borderColor: colors.error
  }
})

const containerStyle = css({
  width: '100%',
  paddingTop: lineHeight,
  position: 'relative',
  display: 'inline-block',
  fontFamily: 'sans-serif',
  fontSize: 22,
  lineHeight: `${lineHeight}px`
})
const labelTextStyle = css({
  position: 'absolute',
  left: xPadding,
  top: yPadding + lineHeight + borderWidth,
  color: colors.disabled,
  transition: 'top 200ms, font-size 200ms'
})
const labelTextTopStyle = css({
  top: 0,
  fontSize: 14
})
const labelTextFocusedStyle = css({
  color: colors.primary
})
const labelTextErrorStyle = css({
  color: colors.error
})

class Field extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      isFocused: false,
      isValidating: false,
      isDirty: false,
      value: ''
    }
    this.inputRef = ref => this.input = ref
  }
  render () {
    const {
      onChange,
      name, type, simulate: sim,
      label, error
    } = this.props
    
    let simulations = {}
    let {isFocused} = this.state
    if (sim) {
      isFocused = sim.indexOf('focus') !== -1
      simulations = simulate(sim)
    }
    const {isValidating, isDirty} = this.state

    const value = this.props.value || this.state.value

    const hasError = !!error
    const labelStyle = (isFocused || value || hasError)
      ? merge(
          labelTextStyle, labelTextTopStyle,
          isFocused && labelTextFocusedStyle,
          hasError && labelTextErrorStyle
        )
      : labelTextStyle
    const fStyle = hasError
      ? merge(fieldStyle, fieldErrorStyle)
      : fieldStyle

    return (
      <label {...containerStyle}>
        <input name={name} type={type} ref={this.inputRef}
          onChange={(event) => {
            let v = event.target.value
            if (onChange) {
              onChange(event, v, isValidating)
              this.setState(() => ({isDirty: true}))
            } else {
              this.setState(() => ({isDirty: true, value: v}))
            }
          }}
          value={value}
          onFocus={() => this.setState(() => ({isFocused: true}))}
          onBlur={(event) => {
            const v = event.target.value
            if (!isValidating && onChange && isDirty) {
              onChange(event, v, true)
            }
            this.setState((state) => ({
              isFocused: false,
              isValidating: state.isDirty
            }))
          }}
          {...fStyle}
          {...simulations} />
        <span {...labelStyle}>{error || label}</span>
      </label>
    )
  }
}

export default Field
