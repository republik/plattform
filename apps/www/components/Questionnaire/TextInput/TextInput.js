import { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { colors, fontStyles, Field } from '@project-r/styleguide'
import TextInputProgress from './TextInputProgress'
import AutosizeInput from 'react-textarea-autosize'
import { styles as fieldSetStyles } from '../../FieldSet'

const styles = {
  form: css({
    borderTop: '1px solid white',
  }),
  textArea: css({
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    minHeight: '60px',
    padding: 0,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    ...fontStyles.sansSerifRegular21,
    color: colors.text,
  }),
  textAreaEmpty: css({
    color: colors.lightText,
    '::-webkit-input-placeholder': {
      color: colors.lightText,
    },
  }),
  maxLength: css({
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '-10px',
    padding: '0 12px',
  }),
  remaining: css({
    ...fontStyles.sansSerifRegular14,
    lineHeight: '20px',
    padding: '0 5px',
  }),
}

class TextInput extends Component {
  getStats = () => {
    const { text = '', maxLength } = this.props
    return {
      count: text.length,
      progress: (text.length / maxLength) * 100,
    }
  }

  renderProgress = () => {
    const { maxLength } = this.props
    if (!maxLength) return null

    const { count, progress } = this.getStats()
    const remaining = maxLength - count
    const progressColor = progress > 100 ? colors.error : colors.text
    return (
      <div {...styles.maxLength}>
        {remaining < 21 && (
          <span {...styles.remaining} style={{ color: progressColor }}>
            {remaining}
          </span>
        )}
        <TextInputProgress
          stroke={progressColor}
          radius={9}
          strokeWidth={2}
          progress={Math.min(progress, 100)}
        />
      </div>
    )
  }

  render() {
    const { text, placeholder, onChange } = this.props
    return (
      <div {...styles.form}>
        <Field
          label={placeholder}
          renderInput={({ ref, ...inputProps }) => (
            <AutosizeInput
              {...inputProps}
              {...fieldSetStyles.autoSize}
              inputRef={ref}
            />
          )}
          value={text}
          onChange={onChange}
        />
        {this.renderProgress()}
      </div>
    )
  }
}

TextInput.propTypes = {
  placeholder: PropTypes.string,
  text: PropTypes.string,
  maxLength: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

TextInput.defaultProps = {
  placeholder: '',
  text: '',
}

export default TextInput
