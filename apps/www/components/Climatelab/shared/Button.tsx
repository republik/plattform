import { FC } from 'react'
import { css } from 'glamor'
import { fontStyles, useColorContext } from '@project-r/styleguide'

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
  const [colorScheme] = useColorContext()

  return (
    <button
      {...colorScheme.set('backgroundColor', 'primary')}
      {...colorScheme.set('color', 'climateButtonText')}
      {...colorScheme.set('borderColor', 'climateBorder')}
      {...css({
        ':hover': {
          backgroundColor: colorScheme.get('primaryHover'),
        },
      })}
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
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    '&:disabled': {
      opacity: 0.8,
    },
  }),
}
