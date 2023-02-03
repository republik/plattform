import { ReactNode } from 'react'
import { plainButtonRule, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'

type ButtonProps = {
  children?: ReactNode
  disabled?: boolean
  onClick?: () => void
}

const Button = ({ children, onClick, disabled }: ButtonProps) => {
  const [colorScheme] = useColorContext()
  return (
    <button
      {...plainButtonRule}
      {...style}
      {...colorScheme.set('color', disabled ? 'disabled' : 'default')}
      {...colorScheme.set('backgroundColor', 'text')}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button

const style = css({
  height: '3.75rem',
  fontSize: '1.375rem',
  minWidth: 160,
  width: '100%',
  padding: '10px 20px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
})
