import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'
import { ClimatelabColors } from '../ClimatelabColors'

type InputProps = {
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
}

const Input = ({ value, type, placeholder, onChange }: InputProps) => {
  return (
    <div {...styles.box}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        {...styles.input}
      />
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
    width: '100%',
    border: 'none',
    outline: 'none',
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: ClimatelabColors.border,
    paddingBottom: 14,
    ...fontStyles.sansSerifBold,
    fontSize: 30,
  }),
}
