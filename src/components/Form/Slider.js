import React from 'react'
import { css, merge } from 'glamor'
import colors from '../../theme/colors'
import { fontStyles } from '../../theme/fonts'

const thumbSize = 18
const trackHeight = 4

const thumbStyle = {
  borderWidth: 0,
  borderRadius: '50%',
  width: thumbSize,
  height: thumbSize,
  background: colors.primary,
  cursor: 'pointer',
  outline: 'none'
}

const trackStyle = {
  background: colors.secondaryBg,
  height: trackHeight
}

const styles = {
  label: css({
    minHeight: thumbSize,
    display: 'inline-block',
    ...fontStyles.sansSerifRegular14,
    color: colors.secondary,
    paddingTop: 0
  }),
  slider: css({
    WebkitAppearance: 'none',
    background: 'transparent',
    outline: 'none',
    width: 260,
    padding: 0,
    marginTop: 0,
    marginRight: 10,
    marginBottom: 0,
    marginLeft: 0,
    verticalAlign: 'middle',
    ':focus': {
      outline: 'none'
    },
    // thumb
    '::-webkit-slider-thumb': {
      ...thumbStyle,
      WebkitAppearance: 'none',
      marginTop: (thumbSize - trackHeight) * -0.5
    },
    '::-moz-focus-outer': {
      border: 0
    },
    '::-moz-range-thumb': {
      ...thumbStyle
    },
    '::-ms-thumb': {
      ...thumbStyle
    },
    // track
    '::-webkit-slider-runnable-track': {
      ...trackStyle,
      width: '100%'
    },
    '::-moz-range-track': {
      ...trackStyle,
      width: '100%'
    },
    '::-ms-track': {
      width: '100%',
      borderColor: 'transparent',
      color: 'transparent',
      background: 'transparent',
      height: thumbSize
    },
    '::-ms-fill-lower': {
      ...trackStyle
    },
    '::-ms-fill-upper': {
      ...trackStyle
    }
  }),
  sliderInactive: css({
    '::-webkit-slider-thumb': {
      background: colors.disabled
    },
    '::-moz-range-thumb': {
      background: colors.disabled
    },
    '::-ms-thumb': {
      background: colors.disabled
    }
  })
}

const Slider = ({ label, labelStyle, inactive, onChange, ...props }) => (
  <label {...styles.label} style={labelStyle}>
    <input
      {...inactive
        ? merge(styles.slider, styles.sliderInactive)
        : styles.slider}
      type='range'
      {...props}
      onChange={e => onChange(e, +e.target.value)}
    />
    {label}
  </label>
)

export default Slider
