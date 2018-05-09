import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {css, merge, simulate} from 'glamor'
import colors from '../../theme/colors'
import {fontFamilies} from '../../theme/fonts'
import {mUp} from '../../theme/mediaQueries'

const xPadding = 0
const yPadding = 9 // (40 - 22) / 2
const borderWidth = 1
const lineHeight = 20
export const fieldHeight = 40

const fieldStyle = css({
  width: '100%',
  appearance: 'none',
  outline: 'none',
  verticalAlign: 'bottom',
  // yPadding can interfere with font
  padding: `0 ${xPadding}px`,
  textDecoration: 'none',
  height: fieldHeight,
  fontFamily: fontFamilies.sansSerifRegular,
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
const fieldIncStyle = css({
  '::-ms-clear': {
    display: 'none'
  },
  '::-webkit-inner-spin-button': {
    appearance: 'none'
  },
  '::-webkit-outer-spin-button': {
    appearance: 'none'
  }
})
const fieldIconStyle = css({
  paddingRight: fieldHeight
})

const containerStyle = css({
  width: '100%',
  paddingTop: lineHeight,
  position: 'relative',
  display: 'inline-block',
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 22,
  lineHeight: `${lineHeight}px`,
  marginBottom: 15
})
const labelTextStyle = css({
  position: 'absolute',
  left: xPadding,
  top: lineHeight + yPadding,
  color: colors.disabled,
  transition: 'top 200ms, font-size 200ms'
})
const labelTextTopStyle = css({
  top: 3,
  fontSize: 12,
  lineHeight: '13px',
  [mUp]: {
    top: 5,
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
const arrowUpStyle = css({
  position: 'absolute',
  right: 0,
  top: lineHeight + 3,
  cursor: 'pointer'
})
const arrowDownStyle = css({
  position: 'absolute',
  right: 0,
  top: lineHeight + fieldHeight / 2 - 3,
  cursor: 'pointer'
})
const iconWrapperStyle = css({
  position: 'absolute',
  right: 3,
  top: lineHeight + 5
})

const ArrowUp = ({size, fill, ...props}) => (
  <svg {...props} fill={fill} {...arrowUpStyle} width={size} height={size} viewBox='0 0 24 24'>
    <path d='M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z' />
    <path d='M0 0h24v24H0z' fill='none' />
  </svg>
)
const ArrowDown = ({size, fill, ...props}) => (
  <svg {...props} fill={fill} {...arrowDownStyle} width={size} height={size} viewBox='0 0 24 24'>
    <path d='M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z' />
    <path d='M0 0h24v24H0z' fill='none' />
  </svg>
)

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
      renderInput,
      onInc,
      onDec,
      isFocused: isFocusedFromProps,
      icon
    } = this.props

    let simulationClassName
    let {isFocused} = this.state
    if (sim) {
      isFocused = sim.indexOf('focus') !== -1
      simulationClassName = simulate(sim).toString()
    }
    if (isFocusedFromProps !== undefined) {
      isFocused = isFocusedFromProps
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

    const hasIncrease = !!onInc
    const hasDecrease = !!onDec
    const hasError = !!error
    const labelStyle = (isFocused || value || hasError)
      ? merge(
          labelTextStyle, labelTextTopStyle,
          isFocused && labelTextFocusedStyle,
          hasError && labelTextErrorStyle,
          colorStyle
        )
      : merge(labelTextStyle, colorStyle)
    const incStyle = hasIncrease ? fieldIncStyle : undefined
    const iconStyle = icon ? fieldIconStyle : undefined
    const fStyle = hasError
      ? merge(fieldStyle, fieldErrorStyle, incStyle, colorStyle, iconStyle)
      : merge(fieldStyle, incStyle, colorStyle, iconStyle)

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
        {hasDecrease && (
          <ArrowDown
            fill={isFocused ? colors.primary : colors.disabled}
            size={fieldHeight / 2}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDec()
              if (this.input) {
                this.input.focus()
              }
            }} />
        )}
        {hasIncrease && (
          <ArrowUp
            fill={isFocused ? colors.primary : colors.disabled}
            size={fieldHeight / 2}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onInc()
              if (this.input) {
                this.input.focus()
              }
            }} />
        )}
        {icon && (
          <span {...iconWrapperStyle}>{icon}</span>
        )}
      </label>
    )
  }
}

Field.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  renderInput: PropTypes.func.isRequired,
  isFocused: PropTypes.bool,
  icon: PropTypes.node
}

Field.defaultProps = {
  renderInput: props => (
    <input {...props} />
  )
}

export default Field
