import AutosizeInput from 'react-textarea-autosize'

import { Field } from '@project-r/styleguide'

import { styles as fieldSetStyles } from '../../FieldSet'

const Statement = ({ statement, handleStatement, label }) => (
  <Field
    label={label}
    renderInput={({ ref, ...inputProps }) => (
      <AutosizeInput
        {...inputProps}
        {...fieldSetStyles.autoSize}
        inputRef={ref}
      />
    )}
    value={statement.value}
    error={statement.dirty && statement.error}
    dirty={statement.dirty}
    onChange={(_, value, shouldValidate) =>
      handleStatement(value, shouldValidate)
    }
  />
)

export default Statement
