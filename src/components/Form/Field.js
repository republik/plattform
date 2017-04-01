import React, {Component, PropTypes} from 'react'
import {css, merge, simulate} from 'glamor'
import * as colors from '../../theme/colors'

const xPadding = 0
const yPadding = 9
const borderWidth = 1
const lineHeight = 20
export const fieldHeight = 40

const fieldStyle = css({
  width: '100%',
  appearance: 'none',
  outline: 'none',
  verticalAlign: 'bottom',
  padding: `${yPadding}px ${xPadding}px`,
  textDecoration: 'none',
  height: fieldHeight,
  fontSize: 22,
  boxSizing: 'border-box',
  backgroundColor: 'white',
  border: 'none',
  borderBottom: `solid ${colors.disabled} ${borderWidth}px`,
  borderRadius: 0,
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
  bottom: yPadding + borderWidth,
  color: colors.disabled,
  transition: 'bottom 200ms, font-size 200ms'
})
const labelTextTopStyle = css({
  bottom: fieldHeight,
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
      label, error,
      renderInput
    } = this.props
    
    let simulationClassName
    let {isFocused} = this.state
    if (sim) {
      isFocused = sim.indexOf('focus') !== -1
      simulationClassName = simulate(sim).toString()
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
        {renderInput({
          name,
          type,
          ref: this.inputRef,
          onChange: (event) => {
            let v = event.target.value
            if (onChange) {
              onChange(event, v, isValidating)
              this.setState(() => ({isDirty: true}))
            } else {
              this.setState(() => ({isDirty: true, value: v}))
            }
          },
          value,
          onFocus: () => this.setState(() => ({isFocused: true})),
          onBlur: (event) => {
            const v = event.target.value
            if (!isValidating && onChange && isDirty) {
              onChange(event, v, true)
            }
            this.setState((state) => ({
              isFocused: false,
              isValidating: state.isDirty
            }))
          },
          className: [
            fStyle.toString(),
            simulationClassName
          ].filter(Boolean).join(' ')
        })}
        <span {...labelStyle}>{error || label}</span>
      </label>
    )
  }
}

Field.propTypes = {
  error: PropTypes.string,
  renderInput: PropTypes.func.isRequired
}

Field.defaultProps = {
  renderInput: props => (
    <input {...props} />
  )
}

export default Field
