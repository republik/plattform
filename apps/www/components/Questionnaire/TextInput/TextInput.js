import PropTypes from 'prop-types'
import { css } from 'glamor'
import {
  useColorContext,
  ProgressCircle,
  fontStyles,
  Field,
} from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'
import { styles as fieldSetStyles } from '../../FieldSet'

const styles = {
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

const TextInput = (props) => {
  const { text = '', maxLength } = props
  const count = text.length
  const progress = (count / maxLength) * 100
  const remaining = maxLength - count
  const progressColorName = progress > 100 ? 'error' : 'text'
  const [colorScheme] = useColorContext()

  const { placeholder, onChange } = props
  return (
    <div>
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
      {maxLength && (
        <div {...styles.maxLength}>
          {remaining < 21 && (
            <span
              {...styles.remaining}
              {...colorScheme.set('color', progressColorName)}
            >
              {remaining}
            </span>
          )}
          <ProgressCircle
            strokeColorName={progressColorName}
            size={18}
            strokeWidth={2}
            progress={Math.min(progress, 100)}
          />
        </div>
      )}
    </div>
  )
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
