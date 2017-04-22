import React, {Component, PropTypes} from 'react'
import {css, merge, simulate} from 'glamor'
import * as colors from '../../theme/colors'
import {fontFamilies} from '../../theme/fonts'
import {mUp} from '../../theme/mediaQueries'

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
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 22,
  lineHeight: `${lineHeight}px`
})
const labelTextStyle = css({
  position: 'absolute',
  left: xPadding,
  top: lineHeight + yPadding,
  color: colors.disabled,
  transition: 'top 200ms, font-size 200ms'
})
const labelTextTopStyle = css({
  top: 0,
  fontSize: 12,
  lineHeight: '13px',
  [mUp]: {
    fontSize: 14,
    lineHeight: '15px',
  }
})
const labelTextFocusedStyle = css({
  color: colors.primary
})
const labelTextErrorStyle = css({
  color: colors.error
})
const whiteStyle = css({
  backgroundColor: 'transparent',
  color: '#fff',
  borderColor: '#fff',
  ':focus': {
    borderColor: '#fff'
  }
})
const blackStyle = css({
  backgroundColor: 'transparent',
  color: '#000',
  borderColor: '#000',
  ':focus': {
    borderColor: '#000'
  }
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
      name, autoComplete,
      type, simulate: sim,
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

    let colorStyle
    if (this.props.black) {
      colorStyle = blackStyle
    }
    if (this.props.white) {
      colorStyle = whiteStyle
    }

    const hasError = !!error
    const labelStyle = (isFocused || value || hasError)
      ? merge(
          labelTextStyle, labelTextTopStyle,
          isFocused && labelTextFocusedStyle,
          hasError && labelTextErrorStyle,
          colorStyle
        )
      : merge(labelTextStyle, colorStyle)
    const fStyle = hasError
      ? merge(fieldStyle, fieldErrorStyle, colorStyle)
      : merge(fieldStyle, colorStyle)

    return (
      <label {...containerStyle}>
        {renderInput({
          name,
          autoComplete,
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
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  renderInput: PropTypes.func.isRequired
}

Field.defaultProps = {
  renderInput: props => (
    <input {...props} />
  )
}

export default Field
