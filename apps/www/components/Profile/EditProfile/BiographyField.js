import { Field } from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'

export default function Biographyfield({ values, dirty, errors, onChange, t }) {
  return (
    <Field
      value={values.biography}
      label={t('profile/biography/label')}
      dirty={dirty.biography}
      error={errors.biography}
      renderInput={({ ref, ...inputProps }) => (
        <AutosizeInput {...inputProps} ref={ref} />
      )}
      onChange={(_, value, shouldValidate) => {
        onChange({
          values: {
            biography: value,
          },
          errors: {
            biography:
              value &&
              value.trim().length >= 1500 &&
              t('profile/biography/label/tooLong'),
          },
          dirty: {
            biography: shouldValidate,
          },
        })
      }}
    />
  )
}
