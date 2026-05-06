import { css } from '@republik/theme/css'
import { Form as RadixForm } from 'radix-ui'

const styles = {
  Field: css({ display: 'flex', flexDirection: 'column', gap: '2' }),
  Label: css({
    fontSize: 's',
    display: 'flex',
    alignItems: 'baseline',
    gap: '2',
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

export function TextField({
  label,
  description,
  children,
  ...rootProps
}: {
  label: string
  description?: string
} & RadixForm.FormFieldProps) {
  return (
    <RadixForm.Field className={styles.Field} {...rootProps}>
      <RadixForm.Label className={styles.Label}>{label}</RadixForm.Label>

      {children}

      {/*<RadixForm.Message className={styles.Error} />*/}

      {description && <p className={styles.Description}>{description}</p>}
    </RadixForm.Field>
  )
}

export function InlineField({
  label,
  description,
  children,
  ...rootProps
}: {
  label: string
  description?: string
} & RadixForm.FormFieldProps) {
  return (
    <RadixForm.Field className={styles.Field} {...rootProps}>
      <RadixForm.Label className={styles.Label}>
        {children}
        {label}
      </RadixForm.Label>

      {description && <p className={styles.Description}>{description}</p>}
    </RadixForm.Field>
  )
}
