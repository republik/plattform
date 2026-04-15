import { Component } from 'react'
import compose from 'lodash/flowRight'
import { withApollo } from '@apollo/client/react/hoc'
import { css, merge } from 'glamor'
import debounce from 'lodash/debounce'
import { v4 as uuid } from 'uuid'

import { colors, Interaction } from '@project-r/styleguide'

import questionStyles from './questionStyles'
import QuestionHeader from './QuestionHeader'
import QuestionIndex from './QuestionIndex'

const { P } = Interaction

const thumbSize = 24

const thumbStyle = {
  borderWidth: 0,
  borderRadius: '50%',
  width: thumbSize,
  height: thumbSize,
  background: colors.primary,
  outline: 'none',
}

const trackStyle = {
  background: colors.secondaryBg,
  height: 5,
}

const styles = {
  sliderWrapper: css({
    position: 'relative',
    minHeight: 30,
    maxHeight: 50,
    width: '100%',
  }),
  slider: css({
    WebkitAppearance: 'none',
    width: '100%',
    background: 'transparent',
    outline: 'none',
    ':focus': {
      outline: 'none',
    },
    // thumb
    '::-webkit-slider-thumb': {
      ...thumbStyle,
      WebkitAppearance: 'none',
      marginTop: -9,
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
  sliderEmpty: css({
    '::-webkit-slider-thumb': {
      background: colors.disabled,
    },
    '::-moz-range-thumb': {
      background: colors.disabled,
    },
    '::-ms-thumb': {
      background: colors.disabled,
    },
  }),
  ticks: css({
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    textAlign: 'center',
    paddingLeft: 0,
    '& div:first-child': {
      textAlign: 'left',
      paddingRight: 5,
    },
    '& div:last-child': {
      textAlign: 'right',
      paddingLeft: 5,
    },
  }),
}

const sliderDefault = merge(styles.slider, styles.sliderEmpty)

class RangeQuestion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      answerId:
        (props.question.userAnswer && props.question.userAnswer.id) || uuid(),
      ...this.deriveStateFromProps(props),
    }
  }

  deriveStateFromProps(props) {
    return props.question.userAnswer
      ? props.question.userAnswer.payload
      : { value: null }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.question.userAnswer !== this.props.question.userAnswer) {
      this.setState(this.deriveStateFromProps(nextProps))
    }
  }

  renderInput = () => {
    const {
      question: { ticks, kind, metadata },
    } = this.props
    const { value } = this.state
    const tickValues = ticks.map((t) => t.value)
    const max = Math.max(...tickValues)
    const min = Math.min(...tickValues)

    let defaultValue
    let step
    if (kind === 'continous') {
      step = ticks.length / 100
      const spansZero = (min < 0 || max < 0) && !(min < 0 && max < 0)
      defaultValue = spansZero ? 0 : Math.abs(min - max) / 2
    } else {
      step = metadata?.step || tickValues[1] - tickValues[0] // we assume a regular interval between ticks
      const middleTickIndex = Math.floor(tickValues.length / 2)
      defaultValue = metadata?.initialValue || tickValues[middleTickIndex]
    }

    return (
      <div {...styles.sliderWrapper}>
        <input
          {...(value === null ? sliderDefault : styles.slider)}
          type='range'
          min={min}
          max={max}
          step={step}
          value={value === null ? defaultValue : value}
          onChange={(e) => this.handleChange(+e.target.value)}
          onMouseDownCapture={() =>
            value === null && this.handleChange(defaultValue)
          }
        />
      </div>
    )
  }

  renderLabels = () => {
    const {
      question: { ticks },
    } = this.props
    const total = ticks.length
    return (
      <div {...styles.ticks}>
        {ticks.map((t, i) => (
          <div
            key={t.label}
            style={{
              width: `${100 / total}%`,
              textWrap: 'nowrap',
            }}
          >
            <span style={i === total - 1 ? { float: 'right' } : {}}>
              {t.label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  onChangeDebounced = debounce(this.props.onChange, 500)

  handleChange = (value) => {
    const { answerId } = this.state
    this.setState({ value })
    this.onChangeDebounced(answerId, value)
  }

  render() {
    const {
      questionCount,
      question: { text, explanation, order, metadata },
    } = this.props
    return (
      <div>
        <QuestionHeader metadata={metadata} />
        <QuestionIndex order={order} questionCount={questionCount} />
        {text && <P {...questionStyles.text}>{text}</P>}
        {explanation && <P {...questionStyles.help}>{explanation}</P>}
        <div {...questionStyles.body}>
          {this.renderInput()}
          {this.renderLabels()}
        </div>
      </div>
    )
  }
}

export default compose(withApollo)(RangeQuestion)
