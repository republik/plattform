import { Field as BaseField } from '@base-ui/react/field'
import { css } from '@republik/theme/css'

const styles = {
  Field: css({ display: 'flex', flexDirection: 'column', gap: '2' }),
  Label: css({
    fontSize: 's',
    display: 'block',
    color: 'text',
    fontWeight: 'medium',
    textAlign: 'left',
    _invalid: {
      color: 'error',
    },
  }),
  Control: css({}),
  Error: css({ fontSize: 's', color: 'error' }),
  Description: css({
    color: 'textSoft',
    fontSize: 'xs',
  }),
}

function FieldRoot({
  label,
  description,
  children,
  ...rootProps
}: {
  label: string
  description?: string
} & BaseField.Root.Props) {
  return (
    <BaseField.Root className={styles.Field} {...rootProps}>
      <BaseField.Label className={styles.Label}>{label}</BaseField.Label>

      {children}

      <BaseField.Error className={styles.Error} />

      {description && (
        <BaseField.Description className={styles.Description}>
          {description}
        </BaseField.Description>
      )}
    </BaseField.Root>
  )
}

export const Field = {
  Root: FieldRoot,
}
