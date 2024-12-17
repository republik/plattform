import { Field } from '@project-r/styleguide'
import { styles as fieldSetStyles } from '../../FieldSet'

export default function PgpPublicKeyField({
  values,
  dirty,
  errors,
  onChange,
  t,
}) {
  return (
    <Field
      value={values.pgpPublicKey}
      label={t('profile/contact/pgpPublicKey/label')}
      dirty={dirty.pgpPublicKey}
      error={errors.pgpPublicKey}
      renderInput={(props) => (
        <textarea rows={1} {...fieldSetStyles.autoSize} {...props} />
      )}
      onChange={(_, value, shouldValidate) => {
        if (!!value && value.match(/PGP PRIVATE KEY/)) {
          onChange({
            values: {
              pgpPublicKey: '',
            },
          })
          window.alert(t('profile/contact/pgpPublicKey/error/private'))
          return
        }
        onChange({
          values: {
            pgpPublicKey: value,
          },
          errors: {
            pgpPublicKey:
              !!value &&
              !value.match(
                /(-----BEGIN PGP PUBLIC KEY BLOCK-----)(.|\n){56,}(-----END PGP PUBLIC KEY BLOCK-----)/,
              ) &&
              t('profile/contact/pgpPublicKey/error/noKey'),
          },
          dirty: {
            pgpPublicKey: shouldValidate,
          },
        })
      }}
    />
  )
}
