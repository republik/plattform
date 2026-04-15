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
  const { text = '', label = '', maxLength, onChange } = props
  const count = text.length
  const progress = (count / maxLength) * 100
  const remaining = maxLength - count
  const progressColorName = progress > 100 ? 'error' : 'textSoft'
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()

  return (
    <div>
      <Field
        label={label}
        renderInput={({ ref, ...inputProps }) => (
          <AutosizeInput
            {...inputProps}
            {...fieldSetStyles.autoSize}
            {...styles.textArea}
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
            {t(`questionnaire/text/${remaining >= 100 ? 'max' : 'remaining'}`, {
              remaining,
              maxLength,
            })}
          </span>
          {progress > 33 && (
            <span style={{ marginLeft: 5, marginBottom: -3 }}>
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

export default TextInput
