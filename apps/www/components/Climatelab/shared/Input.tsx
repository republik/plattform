import { css } from 'glamor'
import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { ClimatelabColors } from '../ClimatelabColors'
import { useField } from 'formik'
import ErrorText from './ErrorText'

type InputProps = {
  name: string
  placeholder?: string
  type?: string
} & unknown

const Input = ({ name, type, placeholder, ...props }: InputProps) => {
  const [fieldProps, meta] = useField(name)

  return (
    <div>
      <label {...styles.box}>
        <input
          {...fieldProps}
          name={name}
          type={type}
          placeholder={placeholder}
          {...styles.input}
          {...props}
        />
      </label>
      {meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>}
    </div>
  )
}

export default Input

const styles = {
  box: css({
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
    lineHeight: '24px',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: ClimatelabColors.border,
    borderRadius: 8,
    padding: 24,
  }),
  input: css({
    ...fontStyles.sansSerifBold,
    width: '100%',
    border: 'none',
    outline: 'none',
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: ClimatelabColors.border,
    paddingBottom: 14,
    fontSize: 20,
    [mediaQueries.mUp]: {
      fontSize: 30,
    },
  }),
}
