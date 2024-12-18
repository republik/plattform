import { Field } from '@project-r/styleguide'

export default function ProlitterisIdField({
  values,
  dirty,
  errors,
  onChange,
  t
}) {
  return (
    <Field
      value={values.prolitterisId}
      label={t('profile/contact/prolitterisId/label')}
      dirty={dirty.prolitterisId}
      error={errors.prolitterisId}
      onChange={(_, value, shouldValidate) => {
        onChange({
          values: {
            prolitterisId: value,
          },
          errors: {
            prolitterisId:
              !!value &&
              !value.match(/^\d{6}$/) &&
              t('profile/contact/prolitterisId/error'),
          },
          dirty: {
            prolitterisId: shouldValidate,
          },
        })
      }}
    />
  )
}
