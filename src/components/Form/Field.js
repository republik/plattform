import React, {Component} from 'react'
import {css, merge, simulate} from 'glamor'
import {border, borderFocus, textLabel} from '../../colors'

const xPadding = 8
const yPadding = 10
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
  boxSizing: 'border-box',
  backgroundColor: 'white',
  border: `solid ${border} ${borderWidth}px`,
  color: '#000',
  ':focus': {
    borderColor: borderFocus
  }
})
const containerStyle = css({
  width: '100%',
  paddingTop: lineHeight,
  position: 'relative',
  display: 'inline-block',
  fontFamily: 'sans-serif',
  fontSize: 14,
  lineHeight: `${lineHeight}px`
})
const labelTextStyle = css({
  position: 'absolute',
  left: xPadding,
  top: yPadding + lineHeight + borderWidth,
  color: textLabel,
  transition: 'top 200ms, font-size 200ms'
})
const labelTextFocusedStyle = css({
  top: 0,
  fontSize: 10
})

class Field extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      focused: false,
      value: ''
    }
  }
  render () {
    const {onChange, type, simulate: sim, label} = this.props
    
    let simulations = {}
    let {focused} = this.state
    if (sim) {
      focused = sim.indexOf('focus') !== -1
      simulations = simulate(sim)
    }

    const value = this.props.value || this.state.value

    const labelStyle = (focused || value)
      ? merge(labelTextStyle, labelTextFocusedStyle)
      : labelTextStyle

    return (
      <label {...containerStyle}>
        <input type={type}
          onChange={onChange || ((event) => {
            const v = event.target.value
            this.setState(() => ({value: v}))
          })}
          value={value}
          onFocus={() => this.setState(() => ({focused: true}))}
          onBlur={() => this.setState(() => ({focused: false}))}
          {...fieldStyle}
          {...simulations} />
        <span {...labelStyle}>{label}</span>
      </label>
    )
  }
}

export default Field
