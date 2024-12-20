import { Field } from '@project-r/styleguide'

export default function Biographyfield({ values, dirty, errors, onChange, t }) {
  return (
    <Field
      value={values.biography}
      label={t('profile/biography/label')}
      dirty={dirty.biography}
      error={errors.biography}
      onChange={(_, value, shouldValidate) => {
        onChange({
          values: {
            biography: value,
          },
          errors: {
            biography:
              value &&
              value.trim().length >= 200 &&
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
