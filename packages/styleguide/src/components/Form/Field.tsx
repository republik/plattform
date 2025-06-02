import { IconClose } from '@republik/icons'
import { css, merge, simulate } from 'glamor'
import React, {
  MutableRefObject,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react'
import { fontStyles } from '../../theme/fonts'
import { mUp } from '../../theme/mediaQueries'
import { plainButtonRule } from '../Button'
import { useColorContext } from '../Colors/ColorContext'
import {
  BORDER_WIDTH,
  FIELD_HEIGHT,
  LINE_HEIGHT,
  X_PADDING,
  Y_PADDING,
} from './constants'

const styles = {
  container: css({
    width: '100%',
    paddingTop: LINE_HEIGHT,
    position: 'relative',
    display: 'inline-block',
    ...fontStyles.sansSerifRegular,
    fontSize: 22,
    lineHeight: `${LINE_HEIGHT}px`,
    marginBottom: 15,
    cursor: 'text',
  }),
  field: css({
    width: '100%',
    appearance: 'none',
    outline: 'none',
    verticalAlign: 'bottom',
    padding: `0 ${X_PADDING}px`,
    textDecoration: 'none',
    height: FIELD_HEIGHT,
    ...fontStyles.sansSerifRegular,
    fontSize: 22,
    boxSizing: 'border-box',
    border: 'none',
    borderBottomWidth: BORDER_WIDTH,
    borderBottomStyle: 'solid',
    borderRadius: 0,
    backgroundColor: 'transparent',
  }),
  labelText: css({
    position: 'absolute',
    left: X_PADDING,
    top: LINE_HEIGHT + Y_PADDING,
    transition: 'top 200ms, font-size 200ms',
  }),
  labelTextFocused: css({
    top: 3,
    fontSize: 12,
    lineHeight: '13px',
    [mUp]: {
      top: 5,
      fontSize: 14,
      lineHeight: '15px',
    },
  }),
  iconWrapper: css({
    position: 'absolute',
    right: 3,
    top: LINE_HEIGHT + 5,
  }),
  arrow: css({
    position: 'absolute',
    right: 0,
    cursor: 'pointer',
  }),
  secondaryActionCenter: css({
    position: 'absolute',
    top: '50%',
    right: 0,
  }),
  noBrowserIcon: css({
    '::-ms-clear': {
      display: 'none',
    },
    '::-webkit-inner-spin-button': {
      appearance: 'none',
    },
    '::-webkit-outer-spin-button': {
      appearance: 'none',
    },
  }),
  fieldIcon: css({
    paddingRight: FIELD_HEIGHT,
  }),
}

export interface ArrowProps extends Record<string, unknown> {
  size: number
  fill?: string
}

const ArrowUp: React.FC<ArrowProps> = ({ size, fill, ...props }) => (
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
const ArrowDown: React.FC<ArrowProps> = ({ size, fill, ...props }) => (
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

const Field = React.forwardRef<
  HTMLInputElement,
  {
    value?: string | number | Date
    onChange?: (
      event: InputEvent,
      value: string | number | Date,
      shouldValidate: boolean,
    ) => void
    onBlur?: (event: InputEvent, value: string | number | Date) => void
    name?: string
    autoComplete?: boolean
    type?: string
    label?: string
    disabled?: boolean
    required?: boolean
    error?: string | boolean
    onInc?: () => void
    onDec?: () => void
    showClearIcon?: boolean
    icon?: ReactNode
    simulate?: string
    renderInput?: React.FC<Record<string, unknown>>
  }
>(
  (
    {
      onChange,
      onBlur,
      name,
      autoComplete,
      type,
      simulate: sim,
      label,
      error,
      onInc,
      onDec,
      showClearIcon,
      icon,
      disabled,
      required,
      value,
      renderInput = (props) => <input {...props} />,
    },
    forwardRef,
  ) => {
    const [isFocused, setIsFocused] = useState(
      sim && sim.indexOf('focus') !== -1,
    )
    const [isValidating, setIsValidating] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [localStateValue, setLocalStateValue] = useState('')
    const ownRef = useRef<HTMLInputElement>()
    const [colorScheme] = useColorContext()

    const inputRef = (forwardRef ||
      ownRef) as MutableRefObject<HTMLInputElement>

    const simulationClassName = sim && simulate(sim).toString()
    const fieldValue = value !== undefined ? value : localStateValue
    const hasIncrease = !!onInc
    const hasDecrease = !!onDec
    const hasValue =
      fieldValue !== undefined &&
      fieldValue !== null &&
      String(fieldValue).length !== 0
    const browserIconStyle =
      hasIncrease || showClearIcon || icon ? styles.noBrowserIcon : undefined
    const iconStyle = icon ? styles.fieldIcon : undefined

    const styleRules = useMemo(() => {
      return {
        labelText: css({
          color: colorScheme.getCSSColor(
            error ? 'error' : isFocused ? 'primary' : 'disabled',
          ),
        }),
        field: css({
          borderColor: colorScheme.getCSSColor(
            error ? 'error' : isFocused ? 'primary' : 'divider',
          ),
          color: colorScheme.getCSSColor(
            error ? 'error' : disabled ? 'disabled' : 'text',
          ),
        }),
      }
    }, [colorScheme, isFocused, error, disabled])

    const fStyle = merge(
      styles.field,
      styleRules.field,
      browserIconStyle,
      iconStyle,
    )

    return (
      <label {...styles.container}>
        {renderInput({
          ['aria-required']: required ? true : undefined,
          disabled,
          name,
          autoComplete,
          type,
          ref: inputRef,
          onChange: (event) => {
            const v = event.target.value
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
          onBlur: (event) => {
            const v = event.target.value
            if (onBlur && isDirty) {
              onBlur(event, v)
            } else if (!isValidating && onChange && isDirty) {
              onChange(event, v, true)
            }
            setIsFocused(false)
            setIsValidating(isDirty)
          },
          className: [fStyle.toString(), simulationClassName]
            .filter(Boolean)
            .join(' '),
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
            onClick={(e) => {
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
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onInc()
              if (inputRef.current) {
                inputRef.current.focus()
              }
            }}
          />
        )}
        {!disabled && showClearIcon && hasValue && (
          <button
            {...styles.secondaryActionCenter}
            {...plainButtonRule}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onChange(null, '', true)
              if (inputRef.current) {
                inputRef.current.focus()
              }
            }}
            onBlur={(e) => {}}
            type='button'
          >
            <IconClose
              {...(isFocused
                ? colorScheme.set('fill', 'text')
                : colorScheme.set('fill', 'disabled'))}
              size={FIELD_HEIGHT / 2}
            />
          </button>
        )}
        {icon && <span {...styles.iconWrapper}>{icon}</span>}
      </label>
    )
  },
)

export default Field
