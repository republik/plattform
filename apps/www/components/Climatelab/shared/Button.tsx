import { FC } from 'react'
import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'
import { ClimatelabColors } from '../ClimatelabColors'

type ButtonProps = unknown

const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button {...styles.clearFix} {...styles.button}>
      {children}
    </button>
  )
}

export default Button

const styles = {
  clearFix: css({
    color: 'inherit',
    border: 'none',
    padding: 0,
    font: 'inherit',
    outline: 'inherit',
    textAlign: 'start',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    '&:hover > *': {
      textDecoration: 'underline',
      textDecorationSkip: 'ink',
    },
  }),
  button: css({
    ...fontStyles.sansSerifBold,
    fontsize: 30,
    backgroundColor: ClimatelabColors.primary,
    color: ClimatelabColors.primaryText,
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
  }),
}
