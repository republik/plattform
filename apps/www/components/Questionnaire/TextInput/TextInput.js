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
import { useTranslation } from '../../../lib/withT'

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
    marginTop: '-10px',
  }),
  remaining: css({
    ...fontStyles.sansSerifRegular14,
    fontFeatureSettings: '"tnum" 1, "kern" 1',
    lineHeight: '20px',
  }),
}

const TextInput = (props) => {
  const { text = '', maxLength } = props
  const count = text.length
  const progress = (count / maxLength) * 100
  const remaining = maxLength - count
  const progressColorName = progress > 100 ? 'error' : 'textSoft'
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()

  const { label, onChange } = props
  const isEmpty = !count
  return (
    <div>
      <Field
        label={label}
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
          <span
            {...styles.remaining}
            {...colorScheme.set('color', progressColorName)}
          >
            {t(`questionnaire/text/${isEmpty ? 'max' : 'remaining'}`, {
              remaining,
              maxLength,
            })}
          </span>
          {!isEmpty && (
            <span style={{ marginLeft: 5 }}>
              <ProgressCircle
                strokeColorName={progressColorName}
                size={18}
                strokeWidth={2}
                progress={Math.min(progress, 100)}
              />
            </span>
          )}
        </div>
      )}
    </div>
  )
}

TextInput.propTypes = {
  label: PropTypes.string,
  text: PropTypes.string,
  maxLength: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

TextInput.defaultProps = {
  label: '',
  text: '',
}

export default TextInput
