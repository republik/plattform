import React, { useMemo } from 'react'
import { css, merge } from 'glamor'
import { fontStyles } from '../../theme/fonts'
import { Label } from '../Typography'
import { useColorContext } from '../Colors/useColorContext'

const thumbSize = 24
const trackHeight = 4

const thumbStyle = {
  borderWidth: 0,
  borderRadius: '50%',
  width: thumbSize,
  height: thumbSize,
  cursor: 'pointer',
  outline: 'none',
}

const trackStyle = {
  height: trackHeight,
}

const styles = {
  label: css({
    minHeight: thumbSize,
    display: 'inline-block',
    ...fontStyles.sansSerifRegular14,
    paddingTop: 0,
  }),
  slider: css({
    WebkitAppearance: 'none',
    background: 'transparent',
    outline: 'none',
    width: 260,
    padding: '15px 0',
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    verticalAlign: 'middle',
    ':focus': {
      outline: 'none',
    },
    // thumb
    '::-webkit-slider-thumb': {
      ...thumbStyle,
      WebkitAppearance: 'none',
      marginTop: (thumbSize - trackHeight) * -0.5,
    },
    '::-moz-focus-outer': {
      border: 0,
    },
    '::-moz-range-thumb': {
      ...thumbStyle,
    },
    '::-ms-thumb': {
      ...thumbStyle,
    },
    // track
    '::-webkit-slider-runnable-track': {
      ...trackStyle,
      width: '100%',
    },
    '::-moz-range-track': {
      ...trackStyle,
      width: '100%',
    },
    '::-ms-track': {
      width: '100%',
      borderColor: 'transparent',
      color: 'transparent',
      background: 'transparent',
      height: thumbSize,
    },
    '::-ms-fill-lower': {
      ...trackStyle,
    },
    '::-ms-fill-upper': {
      ...trackStyle,
    },
  }),
  fullWidth: css({
    width: '100%',
  }),
}

interface SliderProps extends Record<string, unknown> {
  min: string | number
  max: string | number
  value: string | number
  title?: string
  label?: string
  fullWidth?: boolean
  inactive?: boolean
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string | number,
  ) => void
  onMouseUp?: (event: React.MouseEvent<HTMLInputElement>) => void
  onMouseDown?: (event: React.MouseEvent<HTMLInputElement>) => void
  onTouchEnd?: (event: React.TouchEvent<HTMLInputElement>) => void
}

const Slider = ({
  min,
  max,
  value,
  title,
  label,
  fullWidth = false,
  inactive,
  onChange,
  onMouseUp,
  onMouseDown,
  onTouchEnd,
  ...props
}: SliderProps) => {
  const [colorScheme] = useColorContext()
  const sliderStyleRules = useMemo(() => {
    return {
      sliderInactive: css({
        '::-webkit-slider-thumb': {
          background: colorScheme.getCSSColor('disabled'),
        },
        '::-moz-range-thumb': {
          background: colorScheme.getCSSColor('disabled'),
        },
        '::-ms-thumb': {
          background: colorScheme.getCSSColor('disabled'),
        },
      }),
      slider: css({
        // thumb
        '::-webkit-slider-thumb': {
          background: colorScheme.getCSSColor('primary'),
        },
        '::-moz-focus-outer': {
          border: 0,
        },
        '::-moz-range-thumb': {
          background: colorScheme.getCSSColor('primary'),
        },
        '::-ms-thumb': {
          background: colorScheme.getCSSColor('primary'),
        },
        // track
        '::-webkit-slider-runnable-track': {
          background: colorScheme.getCSSColor('divider'),
        },
        '::-moz-range-track': {
          background: colorScheme.getCSSColor('divider'),
        },
        '::-ms-fill-lower': {
          background: colorScheme.getCSSColor('divider'),
        },
        '::-ms-fill-upper': {
          background: colorScheme.getCSSColor('divider'),
        },
      }),
    }
  }, [colorScheme])
  return (
    <label
      {...merge(styles.label, fullWidth ? styles.fullWidth : null)}
      {...colorScheme.set('color', 'textSoft')}
    >
      {label && (
        <>
          <Label>{label}</Label>
          <br />
        </>
      )}
      <input
        {...merge(
          styles.slider,
          sliderStyleRules.slider,
          inactive && sliderStyleRules.sliderInactive,
          fullWidth && styles.fullWidth,
        )}
        type='range'
        {...props}
        min={min}
        max={max}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDown}
        onChange={(e) => onChange(e, +e.target.value)}
      />
    </label>
  )
}

export default Slider
