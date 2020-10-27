import React, { useState, useRef, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { css, merge, simulate } from 'glamor'
import { fontFamilies } from '../../theme/fonts'
import { mUp } from '../../theme/mediaQueries'
import { useColorContext } from '../Colors/useColorContext'
import {
  X_PADDING,
  Y_PADDING,
  BORDER_WIDTH,
  LINE_HEIGHT,
  FIELD_HEIGHT
} from './constants'

const styles = {
  container: css({
    width: '100%',
    paddingTop: LINE_HEIGHT,
    position: 'relative',
    display: 'inline-block',
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 22,
    lineHeight: `${LINE_HEIGHT}px`,
    marginBottom: 15,
    cursor: 'text'
  }),
  field: css({
    width: '100%',
    appearance: 'none',
    outline: 'none',
    verticalAlign: 'bottom',
    padding: `0 ${X_PADDING}px`,
    textDecoration: 'none',
    height: FIELD_HEIGHT,
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 22,
    boxSizing: 'border-box',
    border: 'none',
    borderBottomWidth: BORDER_WIDTH,
    borderBottomStyle: 'solid',
    borderRadius: 0,
    backgroundColor: 'transparent'
  }),
  labelText: css({
    position: 'absolute',
    left: X_PADDING,
    top: LINE_HEIGHT + Y_PADDING,
    transition: 'top 200ms, font-size 200ms'
  }),
  labelTextFocused: css({
    top: 3,
    fontSize: 12,
    lineHeight: '13px',
    [mUp]: {
      top: 5,
      fontSize: 14,
      lineHeight: '15px'
    }
  }),
  iconWrapper: css({
    position: 'absolute',
    right: 3,
    top: LINE_HEIGHT + 5
  }),
  arrow: css({
    position: 'absolute',
    right: 0,
    cursor: 'pointer'
  }),
  noBrowserIcon: css({
    '::-ms-clear': {
      display: 'none'
    },
    '::-webkit-inner-spin-button': {
      appearance: 'none'
    },
    '::-webkit-outer-spin-button': {
      appearance: 'none'
    }
  }),
  fieldIcon: css({
    paddingRight: FIELD_HEIGHT
  })
}

const ArrowUp = ({ size, fill, ...props }) => (
  <svg
    {...props}
    fill={fill}
    {...styles.arrow}
    style={{ top: LINE_HEIGHT + 3 }}
    width={size}
    height={size}
    viewBox='0 0 24 24'
  >
    <path d='M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z' />
    <path d='M0 0h24v24H0z' fill='none' />
  </svg>
)
const ArrowDown = ({ size, fill, ...props }) => (
  <svg
    {...props}
    fill={fill}
    {...styles.arrow}
    style={{ top: LINE_HEIGHT + FIELD_HEIGHT / 2 - 3 }}
    width={size}
    height={size}
    viewBox='0 0 24 24'
  >
    <path d='M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z' />
    <path d='M0 0h24v24H0z' fill='none' />
  </svg>
)

const Field = ({
  onChange,
  name,
  autoComplete,
  type,
  simulate: sim,
  label,
  error,
  renderInput,
  onInc,
  onDec,
  icon,
  disabled,
  value
}) => {
  let [isFocused, setIsFocused] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [localStateValue, setLocalStateValue] = useState('')
  const inputRef = useRef()
  const [colorScheme] = useColorContext()

  if (sim && sim.indexOf('focus') !== -1) {
    isFocused = true
  }

  const simulationClassName = sim && simulate(sim).toString()
  const fieldValue = value !== undefined ? value : localStateValue
  const hasIncrease = !!onInc
  const hasDecrease = !!onDec
  const hasValue =
    fieldValue !== undefined &&
    fieldValue !== null &&
    String(fieldValue).length !== 0
  const browserIconStyle =
    hasIncrease || icon ? styles.noBrowserIcon : undefined
  const iconStyle = icon ? styles.fieldIcon : undefined

  const styleRules = useMemo(() => {
    return {
      labelText: css({
        color: colorScheme.getCSSColor(
          error ? 'error' : isFocused ? 'primary' : 'disabled'
        )
      }),
      field: css({
        borderColor: colorScheme.getCSSColor(
          error ? 'error' : isFocused ? 'primary' : 'divider'
        ),
        color: colorScheme.getCSSColor(
          error ? 'error' : disabled ? 'disabled' : 'text'
        )
      })
    }
  }, [colorScheme, isFocused, error, disabled])

  const fStyle = merge(
    styles.field,
    styleRules.field,
    browserIconStyle,
    iconStyle
  )

  return (
    <label {...styles.container}>
      {renderInput({
        disabled,
        name,
        autoComplete,
        type,
        ref: inputRef,
        onChange: event => {
          let v = event.target.value
          if (onChange) {
            onChange(event, v, isValidating)
            setIsDirty(true)
          } else {
            setIsDirty(true)
            setLocalStateValue(v)
          }
        },
        value,
        onFocus: () => setIsFocused(true),
        onBlur: event => {
          const v = event.target.value
          if (!isValidating && onChange && isDirty) {
            onChange(event, v, true)
          }
          setIsFocused(false)
          setIsValidating(isDirty)
        },
        className: [fStyle.toString(), simulationClassName]
          .filter(Boolean)
          .join(' ')
      })}
      <span
        {...styles.labelText}
        {...((isFocused || hasValue || error) && styles.labelTextFocused)}
        {...styleRules.labelText}
      >
        {error || label}
      </span>
      {!disabled && hasDecrease && (
        <ArrowDown
          {...(isFocused
            ? colorScheme.set('fill', 'primary')
            : colorScheme.set('fill', 'disabled'))}
          size={FIELD_HEIGHT / 2}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            onDec()
            if (inputRef.current) {
              inputRef.current.focus()
            }
          }}
        />
      )}
      {!disabled && hasIncrease && (
        <ArrowUp
          {...(isFocused
            ? colorScheme.set('fill', 'primary')
            : colorScheme.set('fill', 'disabled'))}
          size={FIELD_HEIGHT / 2}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            onInc()
            if (inputRef.current) {
              inputRef.current.focus()
            }
          }}
        />
      )}
      {icon && <span {...styles.iconWrapper}>{icon}</span>}
    </label>
  )
}

Field.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  renderInput: PropTypes.func.isRequired,
  icon: PropTypes.node,
  disabled: PropTypes.bool
}

Field.defaultProps = {
  renderInput: props => <input {...props} />
}

export default Field
