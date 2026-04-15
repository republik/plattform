import { Field } from '@project-r/styleguide'

export default function StatementField({ values, dirty, errors, onChange, t }) {
  return (
    <Field
      value={values.statement}
      label={t('profile/statement/label')}
      dirty={dirty.statement}
      error={errors.statement}
      onChange={(_, value, shouldValidate) => {
        onChange({
          values: {
            statement: value,
          },
          errors: {
            statement:
              value.trim().length >= 140 && t('profile/statement/tooLong'),
          },
          dirty: {
            statement: shouldValidate,
          },
        })
      }}
    />
  )
}
