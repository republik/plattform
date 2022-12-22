import { FC } from 'react'
import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'
import { ClimatelabColors } from '../ClimatelabColors'

type ButtonProps = {
  onClick?: () => void
  type?: 'submit' | 'button'
  disabled?: boolean
} & unknown

const Button: FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) => {
  return (
    <button
      {...styles.clearFix}
      {...styles.button}
      onClick={onClick}
      type={type}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

const styles = {
  clearFix: css({
    border: 'none',
    font: 'inherit',
    outline: 'inherit',
    cursor: 'pointer',
    '&:hover > *': {
      textDecoration: 'underline',
      textDecorationSkip: 'ink',
    },
  }),
  button: css({
    ...fontStyles.sansSerifBold,
    fontSize: 30,
    backgroundColor: ClimatelabColors.primary,
    color: ClimatelabColors.primaryText,
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    borderColor: ClimatelabColors.border,
    '&:hover': {
      backgroundColor: ClimatelabColors.primaryHover,
    },
    '&:disabled': {
      opacity: 0.8,
    }
  }),
}
