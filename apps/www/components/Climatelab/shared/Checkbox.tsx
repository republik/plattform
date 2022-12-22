import { ReactNode } from 'react'
import { useField } from 'formik'
import { css } from 'glamor'

import { fontStyles } from '@project-r/styleguide'
import ErrorText from './ErrorText'

type CheckboxProps = {
  name: string
  label: ReactNode
}

const Checkbox = ({ name, label }: CheckboxProps) => {
  const [fieldProps, meta] = useField(name)
  return (
    <div>
      <label {...styles.label}>
        <input type='checkbox' {...fieldProps} />
        <span>{label}</span>
      </label>
      {meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>}
    </div>
  )
}

export default Checkbox

const styles = {
  label: css({
    ...fontStyles.sansSerifBold,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 24,
    '& > * + *': {
      marginLeft: 10,
    },
    '> *': {
      userSelect: 'none',
    },
  }),
}
